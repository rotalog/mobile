import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Client, IMessage } from '@stomp/stompjs';
import { TopBar } from '../../components/layout/TopBar';
import { Badge } from '../../components/ui/index';
import { Button } from '../../components/ui/Button';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

// ── Types ─────────────────────────────────────────────────────────────────────
type Fase = 1 | 2 | 3;

// ── Mock — substituir por dados reais do pedido ───────────────────────────────
const PEDIDO = {
  id: '#4522',
  orderId: 'order-001',
  produto: 'Picanha Angus 4kg',
  fornecedor: 'BovPrime',
  posicaoNaFila: 2,
  totalEntregas: 5,
  // Coordenada do destino (endereço do comprador)
  destinoLat: -3.102,
  destinoLng: -60.015,
};

const STEPS = ['Confirmado', 'Em rota', 'Entregue'];

// ── Component ─────────────────────────────────────────────────────────────────
export function DeliveryScreen({ navigation }: { navigation: any }) {
  const [fase, setFase]                   = useState<Fase>(1);
  const [eta, setEta]                     = useState('~18 min');
  const [entregadorPos, setEntregadorPos] = useState<{ lat: number; lng: number } | null>(null);
  const [conectado, setConectado]         = useState(false);
  const clientRef                         = useRef<Client | null>(null);

  const etapa  = fase === 1 ? 1 : fase === 2 ? 2 : 3;
  const status = fase === 1 ? 'Em separação' : fase === 2 ? 'Em rota' : 'Próximo';

  // Conecta WebSocket nas fases 2 e 3
  useEffect(() => {
    if (fase < 2) return;

    const client = new Client({
      brokerURL: 'wss://api.rotalog.madebyhermes.com/ws',
      reconnectDelay: 5000,
      onConnect: () => {
        setConectado(true);
        client.subscribe(`/topic/tracking/${PEDIDO.orderId}`, (msg: IMessage) => {
          try {
            const payload = JSON.parse(msg.body);
            if (payload.lat && payload.lng) setEntregadorPos({ lat: payload.lat, lng: payload.lng });
            if (payload.eta)                setEta(payload.eta);
            if (payload.phase === 'PRE_ROUTE') setFase(1);
            if (payload.phase === 'IN_ROUTE')  setFase(2);
            if (payload.phase === 'NEXT_STOP') setFase(3);
          } catch {}
        });
      },
      onDisconnect: () => setConectado(false),
      onStompError:  () => setConectado(false),
    });

    client.activate();
    clientRef.current = client;
    return () => { client.deactivate(); };
  }, [fase]);

  // Região do mapa — usa posição do entregador se disponível, senão destino
  const regiaoBase = {
    latitude:      entregadorPos?.lat ?? PEDIDO.destinoLat,
    longitude:     entregadorPos?.lng ?? PEDIDO.destinoLng,
    latitudeDelta:  0.012,
    longitudeDelta: 0.012,
  };

  return (
    <View style={s.container}>
      <TopBar title="Acompanhar Entregas" />

      {/* Mapa real em todas as fases */}
      <MapView style={s.map} region={regiaoBase}>
        {/* Marker do destino (sempre visível) */}
        <Marker
          coordinate={{ latitude: PEDIDO.destinoLat, longitude: PEDIDO.destinoLng }}
          title="Seu endereço"
        >
          <View style={s.markerDestino}>
            <Text style={{ fontSize: 18 }}>🏠</Text>
          </View>
        </Marker>

        {/* Marker do entregador (visível nas fases 2 e 3 quando tiver posição) */}
        {fase >= 2 && entregadorPos && (
          <Marker
            coordinate={{ latitude: entregadorPos.lat, longitude: entregadorPos.lng }}
            title="Entregador"
            description={`ETA: ${eta}`}
          >
            <View style={s.markerEntregador}>
              <Text style={{ fontSize: 18 }}>🚚</Text>
            </View>
          </Marker>
        )}
      </MapView>

      {/* Badge de status do mapa */}
      <View style={s.mapStatusBar}>
        <Text style={s.mapStatusTxt}>
          {fase === 1
            ? '🟡 Pedido em separação'
            : conectado
            ? '🔴 Rastreamento ao vivo'
            : '⚪ Conectando...'}
        </Text>
        {fase >= 2 && <Text style={s.etaBar}>ETA: {eta}</Text>}
      </View>

      <ScrollView contentContainerStyle={s.list}>

        {/* Card do pedido */}
        <View style={[s.card, { borderColor: `${Colors.green}44` }]}>
          <View style={s.cardTop}>
            <View>
              <Text style={s.cardId}>{PEDIDO.id}</Text>
              <Text style={s.cardProd}>{PEDIDO.produto}</Text>
              <Text style={s.cardSup}>por {PEDIDO.fornecedor}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Badge label={status} />
              <Text style={s.eta}>{eta}</Text>
            </View>
          </View>

          {/* Banner de fase */}
          <View style={s.faseBanner}>
            {fase === 1 && (
              <>
                <Text style={s.faseIcon}>📦</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.faseTitle}>Pedido em separação</Text>
                  <Text style={s.faseSub}>Seu pedido está sendo preparado pelo fornecedor.</Text>
                </View>
              </>
            )}
            {fase === 2 && (
              <>
                <Text style={s.faseIcon}>🚚</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.faseTitle}>Entregador em rota</Text>
                  <Text style={s.faseSub}>Você é a entrega {PEDIDO.posicaoNaFila} de {PEDIDO.totalEntregas}.</Text>
                </View>
              </>
            )}
            {fase === 3 && (
              <>
                <Text style={s.faseIcon}>📍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.faseTitle}>Entregador próximo!</Text>
                  <Text style={s.faseSub}>Seu pedido está chegando. Fique atento!</Text>
                </View>
              </>
            )}
          </View>

          {/* Tracker */}
          <View style={s.tracker}>
            {STEPS.map((step, i) => (
              <React.Fragment key={step}>
                <View style={[s.dot, i < etapa && s.dotActive]}>
                  {i < etapa && <Text style={{ color: '#0A0C0E', fontSize: 10, fontWeight: '900' }}>✓</Text>}
                </View>
                {i < STEPS.length - 1 && (
                  <View style={[s.line, i < etapa - 1 && s.lineActive]} />
                )}
              </React.Fragment>
            ))}
          </View>
          <View style={s.trackerLabels}>
            {STEPS.map(step => <Text key={step} style={s.trackerLabel}>{step}</Text>)}
          </View>
        </View>

        {/* Simulação de fase — remover após WebSocket estar ativo */}
        <View style={s.card}>
          <Text style={s.simLabel}>Simular fase (remover após integração):</Text>
          <View style={s.simRow}>
            {([1, 2, 3] as Fase[]).map(f => (
              <TouchableOpacity
                key={f}
                style={[s.faseBtn, fase === f && s.faseBtnActive]}
                onPress={() => setFase(f)}
              >
                <Text style={[s.faseBtnTxt, fase === f && s.faseBtnTxtActive]}>Fase {f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Empty state */}
        <View style={[s.card, { alignItems: 'center' }]}>
          <Text style={{ color: Colors.muted, fontSize: FontSize.sm, marginBottom: 8 }}>
            Sem outros pedidos ativos
          </Text>
          <Button label="FAZER PEDIDO" onPress={() => navigation.navigate('HomeTab')} sm />
        </View>

      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.bg },

  map:             { height: 220, borderBottomWidth: 1, borderBottomColor: Colors.border },
  markerEntregador:{ backgroundColor: Colors.surface, borderRadius: 20, padding: 5, borderWidth: 2, borderColor: Colors.green },
  markerDestino:   { backgroundColor: Colors.surface, borderRadius: 20, padding: 5, borderWidth: 2, borderColor: Colors.danger },

  mapStatusBar:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, paddingHorizontal: Spacing.xl, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  mapStatusTxt:    { color: Colors.muted, fontSize: FontSize.xs, fontWeight: '600' },
  etaBar:          { color: Colors.green, fontSize: FontSize.xs, fontWeight: '800' },

  list:            { padding: Spacing.xl, gap: 12 },
  card:            { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  cardTop:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  cardId:          { fontWeight: '800', color: Colors.text, fontSize: FontSize.base },
  cardProd:        { color: Colors.muted, fontSize: FontSize.sm },
  cardSup:         { color: Colors.muted, fontSize: FontSize.xs },
  eta:             { color: Colors.green, fontWeight: '800', fontSize: FontSize.base, marginTop: 8 },

  faseBanner:      { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.subtle, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 16 },
  faseIcon:        { fontSize: 28 },
  faseTitle:       { color: Colors.text, fontWeight: '700', fontSize: FontSize.sm, marginBottom: 2 },
  faseSub:         { color: Colors.muted, fontSize: FontSize.xs, lineHeight: 18 },

  tracker:         { flexDirection: 'row', alignItems: 'center' },
  dot:             { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.subtle, alignItems: 'center', justifyContent: 'center' },
  dotActive:       { backgroundColor: Colors.green },
  line:            { flex: 1, height: 2, backgroundColor: Colors.border },
  lineActive:      { backgroundColor: Colors.green },
  trackerLabels:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  trackerLabel:    { color: Colors.muted, fontSize: FontSize.xs },

  simLabel:        { color: Colors.muted, fontSize: FontSize.xs, marginBottom: 8 },
  simRow:          { flexDirection: 'row', gap: 8 },
  faseBtn:         { flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  faseBtnActive:   { backgroundColor: Colors.green, borderColor: Colors.green },
  faseBtnTxt:      { color: Colors.muted, fontSize: FontSize.xs, fontWeight: '700' },
  faseBtnTxtActive:{ color: '#0A0C0E' },
});
