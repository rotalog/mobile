import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Client } from '@stomp/stompjs';
import { TopBar } from '../../components/layout/TopBar';
import { Button } from '../../components/ui/Button';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { api } from '../../services/api';

interface Ponto {
  id: string;
  nome: string;
  endereco: string;
  status: string;
  lat: number;
  lng: number;
  routeId: string;
}

interface Rota {
  id: string;
  origem: string;
  totalEntregas: number;
  kmTotal: number;
  previsao: string;
  status: string;
}

interface BackendRoute {
  id: string | number;
  totalPoints?: number | null;
  status?: string | null;
}

interface BackendPoint {
  id: string | number;
  orderId?: string | number | null;
  latitude?: number | null;
  longitude?: number | null;
  status?: string | null;
}

type BackendPointWithCoordinates = BackendPoint & {
  latitude: number;
  longitude: number;
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  ARRIVED: 'Chegou',
  COMPLETED: 'Entregue',
  FAILED: 'Falhou',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: Colors.warning,
  ARRIVED: Colors.green,
  COMPLETED: Colors.green,
  FAILED: Colors.danger,
};

const ROUTE_STATUS_PRIORITY = ['STARTED', 'PLANNED', 'COMPLETED'] as const;
const ACTIONABLE_POINT_STATUSES = new Set(['PENDING', 'ARRIVED']);

function clearGpsInterval(intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>) {
  if (intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }
}

function normalizeTodayRoute(data: BackendRoute | BackendRoute[] | null | undefined) {
  const routes = Array.isArray(data) ? data : data ? [data] : [];

  if (routes.length === 0) {
    return null;
  }

  return routes
    .slice()
    .sort((left, right) => {
      const leftPriority = ROUTE_STATUS_PRIORITY.indexOf((left.status ?? 'PLANNED') as typeof ROUTE_STATUS_PRIORITY[number]);
      const rightPriority = ROUTE_STATUS_PRIORITY.indexOf((right.status ?? 'PLANNED') as typeof ROUTE_STATUS_PRIORITY[number]);
      const normalizedLeft = leftPriority === -1 ? ROUTE_STATUS_PRIORITY.length : leftPriority;
      const normalizedRight = rightPriority === -1 ? ROUTE_STATUS_PRIORITY.length : rightPriority;
      return normalizedLeft - normalizedRight;
    })[0] ?? null;
}

function mapRoute(route: BackendRoute): Rota {
  return {
    id: String(route.id),
    origem: 'Origem não disponível',
    totalEntregas: route.totalPoints ?? 0,
    kmTotal: 0,
    previsao: '--:--',
    status: route.status ?? 'PLANNED',
  };
}

function hasCoordinates(point: BackendPoint): point is BackendPointWithCoordinates {
  return typeof point.latitude === 'number' && typeof point.longitude === 'number';
}

function mapPoints(points: BackendPoint[], routeId: string): Ponto[] {
  return points
    .filter(hasCoordinates)
    .map((point, index) => ({
      id: String(point.id),
      nome: `Parada ${index + 1}`,
      endereco: 'Endereço não disponível',
      status: point.status ?? 'PENDING',
      lat: point.latitude,
      lng: point.longitude,
      routeId,
    }));
}

export function DriverRouteScreen({ navigation }: { navigation: any }) {
  const [rota, setRota] = useState<Rota | null>(null);
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [loading, setLoading] = useState(true);
  const [iniciada, setIniciada] = useState(false);
  const [erro, setErro] = useState('');
  const [gpsAtivo, setGpsAtivo] = useState(false);

  const stompRef = useRef<Client | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function carregarRota() {
      try {
        setLoading(true);
        setErro('');

        const { data: todayData } = await api.get('/api/v1/routes/today');
        const selectedRoute = normalizeTodayRoute(todayData);

        if (!selectedRoute?.id) {
          setRota(null);
          setPontos([]);
          return;
        }

        const routeId = String(selectedRoute.id);
        const { data: pointsData } = await api.get(`/api/v1/routes/${routeId}/points`);

        const mappedRoute = mapRoute(selectedRoute);
        const mappedPoints = mapPoints(Array.isArray(pointsData) ? pointsData : [], routeId);

        setRota(mappedRoute);
        setPontos(mappedPoints);
        setIniciada(mappedRoute.status === 'STARTED');

        if (mappedRoute.status === 'STARTED') {
          iniciarGPS(mappedRoute.id);
        } else {
          pararGPS();
        }
      } catch {
        setErro('Não foi possível carregar a rota do dia.');
        setRota(null);
        setPontos([]);
        setIniciada(false);
      } finally {
        setLoading(false);
      }
    }

    carregarRota();

    return () => pararGPS();
  }, []);

  const iniciarGPS = async (rotaId: string) => {
    if (stompRef.current) {
      return;
    }

    clearGpsInterval(intervalRef);

    const permissao = await Location.requestForegroundPermissionsAsync();
    if (permissao.status !== 'granted') return;

    const client = new Client({
      brokerURL: 'wss://api.rotalog.madebyhermes.com/ws',
      reconnectDelay: 5000,
      onConnect: () => {
        clearGpsInterval(intervalRef);
        setGpsAtivo(true);

        intervalRef.current = setInterval(async () => {
          try {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            });

            client.publish({
              destination: '/app/tracking/location',
              body: JSON.stringify({
                lat: loc.coords.latitude,
                lng: loc.coords.longitude,
                routeId: rotaId,
                timestamp: new Date().toISOString(),
              }),
            });
          } catch {}
        }, 10000);
      },
      onDisconnect: () => {
        clearGpsInterval(intervalRef);
        setGpsAtivo(false);
      },
      onStompError: () => {
        clearGpsInterval(intervalRef);
        setGpsAtivo(false);
      },
    });

    stompRef.current = client;
    client.activate();
  };

  const pararGPS = () => {
    clearGpsInterval(intervalRef);
    if (stompRef.current) {
      const client = stompRef.current;
      stompRef.current = null;
      client.deactivate();
    }
    setGpsAtivo(false);
  };

  const handleIniciarRota = async () => {
    if (!rota || rota.status !== 'PLANNED' || pontos.length === 0) {
      return;
    }

    try {
      await api.put(`/api/v1/routes/${rota.id}/start`);
      setRota((current) => (current ? { ...current, status: 'STARTED' } : current));
      setIniciada(true);
      await iniciarGPS(rota.id);
    } catch {}
  };

  const temPontosValidos = pontos.length > 0;
  const proximoPontoIndex = pontos.findIndex((ponto) => ACTIONABLE_POINT_STATUSES.has(ponto.status));
  const proximoPonto = proximoPontoIndex >= 0 ? pontos[proximoPontoIndex] : null;
  const temPendenciasAcionaveis = proximoPontoIndex >= 0;
  const rotaConcluida = rota?.status === 'COMPLETED';
  const rotaPodeIniciar = rota?.status === 'PLANNED' && temPontosValidos;
  const rotaEmAndamento = rota?.status === 'STARTED' || iniciada;
  const rotaPodeEncerrar = rotaEmAndamento && temPontosValidos && !temPendenciasAcionaveis;

  const regiao = temPontosValidos ? {
    latitude: pontos[0].lat,
    longitude: pontos[0].lng,
    latitudeDelta: 0.018,
    longitudeDelta: 0.018,
  } : {
    latitude: -3.096,
    longitude: -60.02,
    latitudeDelta: 0.018,
    longitudeDelta: 0.018,
  };

  const rotaCoords = pontos.map((p) => ({ latitude: p.lat, longitude: p.lng }));

  if (loading) {
    return (
      <View style={s.container}>
        <TopBar title="Minha Rota" />
        <View style={s.center}>
          <ActivityIndicator color={Colors.green} size="large" />
          <Text style={s.loadingTxt}>Carregando rota do dia...</Text>
        </View>
      </View>
    );
  }

  if (erro || !rota) {
    return (
      <View style={s.container}>
        <TopBar title="Minha Rota" />
        <View style={s.center}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>📭</Text>
          <Text style={s.erroTxt}>{erro || 'Nenhuma rota para hoje.'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <TopBar
        title="Minha Rota"
        right={
          gpsAtivo ? (
            <View style={s.gpsBadge}>
              <Text style={s.gpsTxt}>📡 GPS ativo</Text>
            </View>
          ) : undefined
        }
      />

      <MapView style={s.map} initialRegion={regiao} provider="google">
        <Polyline coordinates={rotaCoords} strokeColor={Colors.green} strokeWidth={3} />

        {pontos.map((p, i) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.lat, longitude: p.lng }}
            title={p.nome}
          >
            <View style={s.markerWrap}>
              <Text style={s.markerTxt}>{i + 1}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={s.rotaInfo}>
        <View style={s.rotaInfoItem}>
          <Text style={s.rotaInfoVal}>{rota.totalEntregas}</Text>
          <Text style={s.rotaInfoLabel}>Entregas</Text>
        </View>
        <View style={s.rotaInfoDivider} />
        <View style={s.rotaInfoItem}>
          <Text style={s.rotaInfoVal}>{rota.kmTotal} km</Text>
          <Text style={s.rotaInfoLabel}>Total</Text>
        </View>
        <View style={s.rotaInfoDivider} />
        <View style={s.rotaInfoItem}>
          <Text style={s.rotaInfoVal}>⏱ {rota.previsao}</Text>
          <Text style={s.rotaInfoLabel}>Previsão</Text>
        </View>
      </View>

      <FlatList
        data={pontos}
        keyExtractor={(p) => p.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Text style={s.emptyStateText}>Nenhuma parada válida disponível para esta rota.</Text>
          </View>
        }
        renderItem={({ item: p, index }) => (
          <TouchableOpacity
            style={s.card}
            onPress={() => navigation.navigate('DriverNavigation', { ponto: p, index, routeId: rota.id })}
            activeOpacity={0.8}
          >
            <View style={s.cardNum}>
              <Text style={s.cardNumTxt}>{index + 1}</Text>
            </View>
            <View style={s.cardInfo}>
              <Text style={s.cardNome} numberOfLines={1}>{p.nome}</Text>
              <Text style={s.cardEndereco} numberOfLines={1}>{p.endereco}</Text>
            </View>
            <View style={[s.statusBadge, { backgroundColor: `${STATUS_COLOR[p.status] ?? Colors.muted}22` }]}>
              <Text style={[s.statusTxt, { color: STATUS_COLOR[p.status] ?? Colors.muted }]}>
                {STATUS_LABEL[p.status] ?? p.status}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <View style={s.footer}>
        {rotaConcluida ? null : temPontosValidos ? (
          rotaPodeIniciar ? (
            <Button label="INICIAR ROTA" onPress={handleIniciarRota} full />
          ) : rotaEmAndamento && proximoPonto ? (
            <Button
              label="IR PARA PRÓXIMA PARADA"
              onPress={() => navigation.navigate('DriverNavigation', { ponto: proximoPonto, index: proximoPontoIndex, routeId: rota.id })}
              full
            />
          ) : rotaPodeEncerrar ? (
            <Button
              label="ENCERRAR ROTA"
              onPress={() => navigation.navigate('DriverSummary', { routeId: rota.id })}
              full
            />
          ) : null
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingTxt: { color: Colors.muted, fontSize: FontSize.sm, marginTop: 8 },
  erroTxt: { color: Colors.muted, fontSize: FontSize.base, textAlign: 'center', paddingHorizontal: 32 },

  map: { height: 220, borderBottomWidth: 1, borderBottomColor: Colors.border },
  markerWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#0A0C0E' },
  markerTxt: { color: '#0A0C0E', fontWeight: '900', fontSize: FontSize.xs },

  gpsBadge: { backgroundColor: `${Colors.green}22`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: `${Colors.green}44` },
  gpsTxt: { color: Colors.green, fontSize: FontSize.xs, fontWeight: '700' },

  rotaInfo: { flexDirection: 'row', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: Spacing.md },
  rotaInfoItem: { flex: 1, alignItems: 'center' },
  rotaInfoVal: { color: Colors.green, fontWeight: '800', fontSize: FontSize.base },
  rotaInfoLabel: { color: Colors.muted, fontSize: FontSize.xs, marginTop: 2 },
  rotaInfoDivider: { width: 1, backgroundColor: Colors.border },

  list: { padding: Spacing.xl, gap: 10 },
  emptyState: { paddingVertical: Spacing.lg, alignItems: 'center' },
  emptyStateText: { color: Colors.muted, fontSize: FontSize.sm, textAlign: 'center' },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardNumTxt: { color: '#0A0C0E', fontWeight: '900', fontSize: FontSize.sm },
  cardInfo: { flex: 1 },
  cardNome: { color: Colors.text, fontWeight: '700', fontSize: FontSize.sm },
  cardEndereco: { color: Colors.muted, fontSize: FontSize.xs, marginTop: 2 },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  statusTxt: { fontSize: FontSize.xs, fontWeight: '700' },

  footer: { padding: Spacing.xl, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
});
