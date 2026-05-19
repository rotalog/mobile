import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useTheme } from '../../context/ThemeContext';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Client } from '@stomp/stompjs';
import { TopBar } from '../../components/layout/TopBar';
import { Button } from '../../components/ui/Button';
import { FontSize, Radius, Spacing } from '../../theme';
import { api } from '../../services/api';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Ponto {
  id: string;
  nome: string;
  endereco: string;
  status: string;
  lat: number;
  lng: number;
}

interface Rota {
  id: string;
  origem: string;
  totalEntregas: number;
  kmTotal: number;
  previsao: string;
}

// ── Status maps ───────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
  PENDING:   'Pendente',
  ARRIVED:   'Chegou',
  DELIVERED: 'Entregue',
  FAILED:    'Falhou',
};

// ── Component ─────────────────────────────────────────────────────────────────
export function DriverRouteScreen({ navigation }: { navigation: any }) {
  const s = useThemedStyles(buildStyles);
  const { colors } = useTheme();

  const STATUS_COLOR: Record<string, string> = {
    PENDING:   colors.warning,
    ARRIVED:   colors.green,
    DELIVERED: colors.green,
    FAILED:    colors.danger,
  };

  const [rota, setRota]         = useState<Rota | null>(null);
  const [pontos, setPontos]     = useState<Ponto[]>([]);
  const [loading, setLoading]   = useState(true);
  const [iniciada, setIniciada] = useState(false);
  const [erro, setErro]         = useState('');
  const [gpsAtivo, setGpsAtivo] = useState(false);

  const stompRef    = useRef<Client | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Carrega rota do dia ───────────────────────────────────────────────────
  // ── Carrega rota (Versão Mockada para Teste) ───────────────────────────────
  useEffect(() => {
    async function carregarRota() {
      try {
        setLoading(true);
        setErro(''); // Limpa erros antigos

        /* ── COMENTADO: Chamada real da API ──
        const { data: rotaData } = await api.get('/api/v1/routes/today');
        ...
        ── FIM DO COMENTÁRIO ── */

        // ── DADOS MOCKADOS (Aparecerão mesmo com API vazia) ──
        const mockRota = {
          id: 'mock-123',
          origem: 'Manaus - AM',
          totalEntregas: 3,
          kmTotal: 12.5,
          previsao: '14:30',
        };

        const mockPontos = [
          { id: '1', nome: 'Supermercado Nova Era', endereco: 'Av. Torquato Tapajós, 2871', status: 'PENDING', lat: -3.056, lng: -60.015 },
          { id: '2', nome: 'Drogasil Adrianópolis', endereco: 'Rua Teresina, 503', status: 'PENDING', lat: -3.109, lng: -60.012 },
          { id: '3', nome: 'Residencial Mundi', endereco: 'Av. Ephigênio Salles, 2240', status: 'PENDING', lat: -3.092, lng: -59.985 },
        ];

        setRota(mockRota);
        setPontos(mockPontos);

      } catch (e) {
        // Em modo de teste, não definimos erro aqui para não travar a tela
        console.log("Erro ao carregar (ignorando para teste):", e);
      } finally {
        setLoading(false);
      }
    }
    carregarRota();

    return () => pararGPS();
  }, []);

  // ── Inicia envio de GPS via WebSocket ─────────────────────────────────────
  const iniciarGPS = async (rotaId: string) => {
    const permissao = await Location.requestForegroundPermissionsAsync();
    if (permissao.status !== 'granted') return;

    // Conecta no WebSocket STOMP
    const client = new Client({
      brokerURL: 'wss://api.rotalog.madebyhermes.com/ws',
      reconnectDelay: 5000,
      onConnect: () => {
        setGpsAtivo(true);

        // Envia posição a cada 10 segundos
        intervalRef.current = setInterval(async () => {
          try {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            });

            // Envia para /app/tracking/location
            client.publish({
              destination: '/app/tracking/location',
              body: JSON.stringify({
                lat:       loc.coords.latitude,
                lng:       loc.coords.longitude,
                routeId:   rotaId,
                timestamp: new Date().toISOString(),
              }),
            });
          } catch {}
        }, 10000);
      },
      onDisconnect: () => setGpsAtivo(false),
      onStompError:  () => setGpsAtivo(false),
    });

    client.activate();
    stompRef.current = client;
  };

  // ── Para envio de GPS ─────────────────────────────────────────────────────
  const pararGPS = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (stompRef.current) {
      stompRef.current.deactivate();
      stompRef.current = null;
    }
    setGpsAtivo(false);
  };

  // ── Inicia rota ───────────────────────────────────────────────────────────
  // ── Inicia rota (Versão Mockada) ──────────────────────────────────────────
  const handleIniciarRota = async () => {
    if (!rota) return;
    try {
      // await api.put(`/api/v1/routes/${rota.id}/start`); // COMENTADO
      console.log("Rota iniciada (MOCK)");
    } catch {}

    setIniciada(true);
    // iniciarGPS(rota.id); // Comente se não quiser testar o WebSocket agora
  };

  // ── Região do mapa ────────────────────────────────────────────────────────
  const regiao = pontos.length > 0 ? {
    latitude:      pontos[0].lat,
    longitude:     pontos[0].lng,
    latitudeDelta:  0.018,
    longitudeDelta: 0.018,
  } : {
    latitude:      -3.096,
    longitude:     -60.020,
    latitudeDelta:  0.018,
    longitudeDelta: 0.018,
  };

  const rotaCoords = pontos.map(p => ({ latitude: p.lat, longitude: p.lng }));

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={s.container}>
        <TopBar title="Minha Rota" />
        <View style={s.center}>
          <ActivityIndicator color={colors.green} size="large" />
          <Text style={s.loadingTxt}>Carregando rota do dia...</Text>
        </View>
      </View>
    );
  }

  // ── Sem rota ──────────────────────────────────────────────────────────────
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

  // ── Tela principal ────────────────────────────────────────────────────────
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

      {/* Mapa real */}
      <MapView
  style={s.map}
  initialRegion={regiao}
  provider="google" // Força o uso do Google Maps
>
  {/* O Polyline desenha a linha ligando os pontos */}
  <Polyline
    coordinates={pontos.map(p => ({ latitude: p.lat, longitude: p.lng }))}
    strokeColor={colors.green}
    strokeWidth={3}
  />

  {/* Renderiza os Pins */}
  {pontos.map((p, i) => (
    <Marker
      key={p.id}
      coordinate={{ latitude: p.lat, longitude: p.lng }}
      title={p.nome}
    >
      {/* Customização do Pin (opcional) */}
      <View style={s.markerWrap}>
        <Text style={s.markerTxt}>{i + 1}</Text>
      </View>
    </Marker>
  ))}
</MapView>

      {/* Info da rota */}
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

      {/* Lista de pontos */}
      <FlatList
        data={pontos}
        keyExtractor={p => p.id}
        contentContainerStyle={s.list}
        renderItem={({ item: p, index }) => (
          <TouchableOpacity
            style={s.card}
            onPress={() => navigation.navigate('DriverNavigation', { ponto: p, index })}
            activeOpacity={0.8}
          >
            <View style={s.cardNum}>
              <Text style={s.cardNumTxt}>{index + 1}</Text>
            </View>
            <View style={s.cardInfo}>
              <Text style={s.cardNome} numberOfLines={1}>{p.nome}</Text>
              <Text style={s.cardEndereco} numberOfLines={1}>{p.endereco}</Text>
            </View>
            <View style={[s.statusBadge, { backgroundColor: `${STATUS_COLOR[p.status]}22` }]}>
              <Text style={[s.statusTxt, { color: STATUS_COLOR[p.status] }]}>
                {STATUS_LABEL[p.status] ?? p.status}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Botão */}
      <View style={s.footer}>
        {!iniciada ? (
          <Button label="INICIAR ROTA" onPress={handleIniciarRota} full />
        ) : (
          <Button
            label="IR PARA PRÓXIMA PARADA"
            onPress={() => navigation.navigate('DriverNavigation', { ponto: pontos[0], index: 0 })}
            full
          />
        )}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const buildStyles = (c: import('../../theme').ColorPalette) => ({
  container:       { flex: 1, backgroundColor: c.bg },
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingTxt:      { color: c.muted, fontSize: FontSize.sm, marginTop: 8 },
  erroTxt:         { color: c.muted, fontSize: FontSize.base, textAlign: 'center', paddingHorizontal: 32 },

  map:             { height: 220, borderBottomWidth: 1, borderBottomColor: c.border },
  markerWrap:      { width: 28, height: 28, borderRadius: 14, backgroundColor: c.green, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#0A0C0E' },
  markerTxt:       { color: '#0A0C0E', fontWeight: '900', fontSize: FontSize.xs },

  gpsBadge:        { backgroundColor: `${c.green}22`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: `${c.green}44` },
  gpsTxt:          { color: c.green, fontSize: FontSize.xs, fontWeight: '700' },

  rotaInfo:        { flexDirection: 'row', backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.border, paddingVertical: Spacing.md },
  rotaInfoItem:    { flex: 1, alignItems: 'center' },
  rotaInfoVal:     { color: c.green, fontWeight: '800', fontSize: FontSize.base },
  rotaInfoLabel:   { color: c.muted, fontSize: FontSize.xs, marginTop: 2 },
  rotaInfoDivider: { width: 1, backgroundColor: c.border },

  list:            { padding: Spacing.xl, gap: 10 },
  card:            { backgroundColor: c.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: c.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardNum:         { width: 32, height: 32, borderRadius: 16, backgroundColor: c.green, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardNumTxt:      { color: '#0A0C0E', fontWeight: '900', fontSize: FontSize.sm },
  cardInfo:        { flex: 1 },
  cardNome:        { color: c.text, fontWeight: '700', fontSize: FontSize.sm },
  cardEndereco:    { color: c.muted, fontSize: FontSize.xs, marginTop: 2 },
  statusBadge:     { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  statusTxt:       { fontSize: FontSize.xs, fontWeight: '700' },

  footer:          { padding: Spacing.xl, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.surface },
});
