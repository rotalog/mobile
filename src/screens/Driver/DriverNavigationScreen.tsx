import React, { useRef, useState } from 'react';
import { Alert, View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { TopBar } from '../../components/layout/TopBar';
import { Button } from '../../components/ui/Button';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { api } from '../../services/api';

// ── Component ─────────────────────────────────────────────────────────────────
export function DriverNavigationScreen({ navigation, route }: { navigation: any; route: any }) {
  const ponto = route?.params?.ponto ?? {
    id: '1',
    nome: 'Mariana Silva de Oliveira',
    endereco: 'Rua das Palmeiras, 102, Apto 42B - Santa Cecília',
    volumes: '3 caixas (12kg)',
    janela: 'Até 14:30',
    urgente: true,
    lat: -3.096,
    lng: -60.020,
  };

  const [checkinFeito, setCheckinFeito] = useState((ponto.status ?? '') === 'ARRIVED');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const isCheckingInRef = useRef(false);

  const regiao = {
    latitude:      ponto.lat ?? -3.096,
    longitude:     ponto.lng ?? -60.020,
    latitudeDelta:  0.008,
    longitudeDelta: 0.008,
  };

  const endereco = typeof ponto.endereco === 'string' ? ponto.endereco.trim() : '';
  const hasCoordinates = Number.isFinite(ponto.lat) && Number.isFinite(ponto.lng);
  const shouldUseCoordinateFallback = !endereco || endereco === 'Endereço não disponível';
  const coordinateDestination = hasCoordinates ? `${ponto.lat},${ponto.lng}` : '';
  const mapsDestination = shouldUseCoordinateFallback && coordinateDestination
    ? coordinateDestination
    : encodeURIComponent(endereco);
  const wazeDestination = shouldUseCoordinateFallback && coordinateDestination
    ? `ll=${coordinateDestination}`
    : `q=${encodeURIComponent(endereco)}`;

  const abrirMaps = () => {
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${mapsDestination}`);
  };

  const abrirWaze = () => {
    Linking.openURL(`https://waze.com/ul?${wazeDestination}&navigate=yes`);
  };

  const handleCheckin = async () => {
    if (checkinFeito || isCheckingInRef.current) {
      return;
    }

    isCheckingInRef.current = true;
    setIsCheckingIn(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Ative a localização para registrar sua chegada.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      await api.put(`/api/v1/delivery-points/${ponto.id}/arrive`, {
        driverLatitude: location.coords.latitude,
        driverLongitude: location.coords.longitude,
      });

      setCheckinFeito(true);
    } catch {
      Alert.alert('Erro', 'Não foi possível registrar sua chegada. Tente novamente.');
    } finally {
      isCheckingInRef.current = false;
      setIsCheckingIn(false);
    }
  };

  return (
    <View style={s.container}>
      <TopBar title="Navegação" onBack={() => navigation.goBack()} />

      {/* Mapa real com marker do destino */}
      <MapView style={s.map} initialRegion={regiao}>
        <Marker
          coordinate={{ latitude: ponto.lat ?? -3.096, longitude: ponto.lng ?? -60.020 }}
          title={ponto.nome}
          description={ponto.endereco}
        >
          <View style={s.markerDestino}>
            <Text style={{ fontSize: 20 }}>📍</Text>
          </View>
        </Marker>
      </MapView>

      <ScrollView contentContainerStyle={s.list}>

        {/* Info do cliente */}
        <View style={[s.card, ponto.urgente && { borderColor: Colors.danger }]}>
          {ponto.urgente && (
            <View style={s.urgenteBadge}>
              <Text style={s.urgenteTxt}>URGENTE</Text>
            </View>
          )}
          <Text style={s.clienteNome}>{ponto.nome}</Text>
          <Text style={s.clienteEndereco}>{ponto.endereco}</Text>

          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <Text style={s.metaIcon}>📦</Text>
              <View>
                <Text style={s.metaLabel}>Volumes</Text>
                <Text style={s.metaVal}>{ponto.volumes ?? '3 caixas (12kg)'}</Text>
              </View>
            </View>
            <View style={s.metaDivider} />
            <View style={s.metaItem}>
              <Text style={s.metaIcon}>⏰</Text>
              <View>
                <Text style={s.metaLabel}>Janela</Text>
                <Text style={s.metaVal}>{ponto.janela ?? 'Até 14:30'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Navegação */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>— ABRIR NAVEGAÇÃO</Text>
          <View style={s.navRow}>
            <TouchableOpacity style={s.navBtn} onPress={abrirMaps} activeOpacity={0.8}>
              <Text style={{ fontSize: 22 }}>🗺️</Text>
              <Text style={s.navBtnTxt}>Google Maps</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.navBtn} onPress={abrirWaze} activeOpacity={0.8}>
              <Text style={{ fontSize: 22 }}>🚗</Text>
              <Text style={s.navBtnTxt}>Waze</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Check-in */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>— CHECK-IN</Text>
          <Text style={s.checkinSub}>
            {checkinFeito
              ? 'Check-in realizado! Prossiga com a entrega.'
              : 'Chegou ao local? Registre sua chegada.'}
          </Text>
          <Button
            label={checkinFeito ? '✓ CHECK-IN REALIZADO' : 'FAZER CHECK-IN'}
            onPress={handleCheckin}
            variant={checkinFeito ? 'ghost' : 'primary'}
            loading={isCheckingIn}
            disabled={checkinFeito || isCheckingIn}
            full
          />
        </View>

        {/* Ações após check-in */}
        {checkinFeito && (
          <View style={s.acoesRow}>
            <Button
              label="CONFIRMAR ENTREGA"
              onPress={() => navigation.navigate('DriverDelivery', { ponto, routeId: ponto.routeId ?? route?.params?.routeId })}
              style={{ flex: 1 }}
            />
            <Button
              label="REGISTRAR PROBLEMA"
              onPress={() => navigation.navigate('DriverOccurrence', { ponto, routeId: ponto.routeId ?? route?.params?.routeId })}
              variant="danger"
              style={{ flex: 1 }}
            />
          </View>
        )}

      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.bg },
  map:            { height: 220, borderBottomWidth: 1, borderBottomColor: Colors.border },
  markerDestino:  { backgroundColor: Colors.surface, borderRadius: 20, padding: 4, borderWidth: 2, borderColor: Colors.danger },

  list:           { padding: Spacing.xl, gap: 12 },
  card:           { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: 12 },
  sectionLabel:   { fontSize: FontSize.xs, fontWeight: '700', color: Colors.green, letterSpacing: 1.2 },

  urgenteBadge:   { backgroundColor: `${Colors.danger}22`, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  urgenteTxt:     { color: Colors.danger, fontSize: FontSize.xs, fontWeight: '900', letterSpacing: 1 },
  clienteNome:    { color: Colors.text, fontWeight: '800', fontSize: FontSize.lg },
  clienteEndereco:{ color: Colors.muted, fontSize: FontSize.sm, lineHeight: 20 },

  metaRow:        { flexDirection: 'row', backgroundColor: Colors.subtle, borderRadius: Radius.md, padding: Spacing.md },
  metaItem:       { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaDivider:    { width: 1, backgroundColor: Colors.border, marginHorizontal: 8 },
  metaIcon:       { fontSize: 20 },
  metaLabel:      { color: Colors.muted, fontSize: FontSize.xs },
  metaVal:        { color: Colors.text, fontWeight: '700', fontSize: FontSize.sm },

  navRow:         { flexDirection: 'row', gap: 12 },
  navBtn:         { flex: 1, backgroundColor: Colors.subtle, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.border },
  navBtnTxt:      { color: Colors.text, fontWeight: '700', fontSize: FontSize.xs },

  checkinSub:     { color: Colors.muted, fontSize: FontSize.sm },
  acoesRow:       { flexDirection: 'row', gap: 10 },
});