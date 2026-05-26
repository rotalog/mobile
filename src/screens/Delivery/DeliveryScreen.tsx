import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Badge } from '../../components/ui/index';
import { Button } from '../../components/ui/Button';
import { ColorPalette, FontSize, Radius, Spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { DeliveryOrder, DeliveryStatus, useDelivery } from '../../context/DeliveryContext';

const STEPS: { status: DeliveryStatus; label: string; icon: string }[] = [
  { status: 'confirmed', label: 'Confirmado', icon: '📦' },
  { status: 'route', label: 'Em rota', icon: '🚚' },
  { status: 'delivered', label: 'Entregue', icon: '📍' },
];

const STATUS_INDEX: Record<DeliveryStatus, number> = {
  confirmed: 0,
  route: 1,
  delivered: 2,
};

const STATUS_COPY: Record<DeliveryStatus, { title: string; sub: string; badge: string }> = {
  confirmed: {
    title: 'Pedido confirmado',
    sub: 'Seu pedido foi registrado e está sendo preparado pelo fornecedor.',
    badge: 'Confirmado',
  },
  route: {
    title: 'Entregador em rota',
    sub: 'Seu pedido saiu para entrega e está a caminho.',
    badge: 'Em rota',
  },
  delivered: {
    title: 'Pedido entregue',
    sub: 'Entrega concluída. Obrigado por comprar com a RotaLog.',
    badge: 'Entregue',
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
export function DeliveryScreen({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const s = React.useMemo(() => createStyles(colors), [colors]);
  const { orders, updateOrderStatus } = useDelivery();
  const latestOrder = orders[0];

  return (
    <View style={s.container}>
      <TopBar title="Acompanhar Entregas" />

      <View style={s.map}>
        {[...Array(6)].map((_, i) => (
          <View key={`v${i}`} style={[s.gridLine, s.gridLineV, { left: `${i * 20}%` as any }]} />
        ))}
        {[...Array(5)].map((_, i) => (
          <View key={`h${i}`} style={[s.gridLine, s.gridLineH, { top: `${i * 25}%` as any }]} />
        ))}
        <View style={s.liveBadge}>
          <Text style={s.liveText}>
            {orders.length > 0 ? 'AO VIVO' : 'SEM PEDIDOS ATIVOS'}
          </Text>
        </View>
        <Text style={{ fontSize: 48 }}>
          {latestOrder ? STEPS[STATUS_INDEX[latestOrder.status]].icon : '🗺️'}
        </Text>
        {fase >= 2 && <Text style={s.etaBar}>ETA: {eta}</Text>}
      </View>

      <ScrollView contentContainerStyle={s.list}>
        {orders.length === 0 ? (
          <View style={[s.card, { alignItems: 'center' }]}>
            <Text style={s.emptyText}>Sem pedidos ativos no momento</Text>
            <Button label="FAZER PEDIDO" onPress={() => navigation.navigate('HomeTab')} sm />
          </View>
        ) : (
          orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              styles={s}
              colors={colors}
              onChangeStatus={status => updateOrderStatus(order.id, status)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

interface OrderCardProps {
  order: DeliveryOrder;
  styles: ReturnType<typeof createStyles>;
  colors: ColorPalette;
  onChangeStatus: (status: DeliveryStatus) => void;
}

function OrderCard({ order, styles: s, colors, onChangeStatus }: OrderCardProps) {
  const currentStep = STATUS_INDEX[order.status];
  const copy = STATUS_COPY[order.status];
  const firstItem = order.items[0];
  const productLabel = firstItem
    ? `${firstItem.nome}${order.items.length > 1 ? ` +${order.items.length - 1}` : ''}`
    : 'Pedido';
  const supplierLabel = firstItem?.fornecedor ?? 'Fornecedor';

  return (
    <View style={[s.card, { borderColor: `${colors.green}44` }]}>
      <View style={s.cardTop}>
        <View>
          <Text style={s.cardId}>#{order.id}</Text>
          <Text style={s.cardProd}>{productLabel}</Text>
          <Text style={s.cardSup}>por {supplierLabel}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Badge label={copy.badge} />
          <Text style={s.cardTotal}>R$ {order.total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={s.faseBanner}>
        <Text style={s.faseIcon}>{STEPS[currentStep].icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.faseTitle}>{copy.title}</Text>
          <Text style={s.faseSub}>{copy.sub}</Text>
        </View>
      </View>

      <View style={s.tracker}>
        {STEPS.map((step, i) => {
          const isActive = i <= currentStep;
          return (
            <React.Fragment key={step.status}>
              <TouchableOpacity
                style={[s.dot, isActive && s.dotActive]}
                onPress={() => onChangeStatus(step.status)}
                activeOpacity={0.75}
              >
                <Text style={[s.dotText, isActive && { color: colors.onPrimary }]}>
                  {i + 1}
                </Text>
              </TouchableOpacity>
              {i < STEPS.length - 1 && (
                <TouchableOpacity
                  style={[s.line, i < currentStep && s.lineActive]}
                  onPress={() => onChangeStatus(STEPS[i + 1].status)}
                  activeOpacity={0.75}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
      <View style={s.trackerLabels}>
        {STEPS.map(step => (
          <TouchableOpacity key={step.status} onPress={() => onChangeStatus(step.status)}>
            <Text style={[s.trackerLabel, order.status === step.status && s.trackerLabelActive]}>
              {step.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container:       { flex: 1, backgroundColor: colors.bg },
  map:             { height: 200, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: colors.border, position: 'relative', overflow: 'hidden' },
  gridLine:        { position: 'absolute', backgroundColor: `${colors.border}66` },
  gridLineV:       { top: 0, bottom: 0, width: 1 },
  gridLineH:       { left: 0, right: 0, height: 1 },
  liveBadge:       { position: 'absolute', top: 12, left: 12, backgroundColor: colors.overlay, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: `${colors.green}44` },
  liveText:        { color: colors.green, fontWeight: '700', fontSize: FontSize.sm },
  list:            { padding: Spacing.xl, gap: 12 },
  emptyText:       { color: colors.muted, fontSize: FontSize.sm, marginBottom: 8 },
  card:            { backgroundColor: colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: colors.border },
  cardTop:         { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
  cardId:          { fontWeight: '800', color: colors.text, fontSize: FontSize.base },
  cardProd:        { color: colors.muted, fontSize: FontSize.sm },
  cardSup:         { color: colors.muted, fontSize: FontSize.xs },
  cardTotal:       { color: colors.green, fontSize: FontSize.xs, fontWeight: '800', marginTop: 6 },
  faseBanner:      { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.subtle, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 16 },
  faseIcon:        { fontSize: 28 },
  faseTitle:       { color: colors.text, fontWeight: '700', fontSize: FontSize.sm, marginBottom: 2 },
  faseSub:         { color: colors.muted, fontSize: FontSize.xs, lineHeight: 18 },
  tracker:         { flexDirection: 'row', alignItems: 'center' },
  dot:             { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.subtle, alignItems: 'center', justifyContent: 'center' },
  dotActive:       { backgroundColor: colors.green },
  dotText:         { color: colors.muted, fontSize: FontSize.xs, fontWeight: '900' },
  line:            { flex: 1, height: 6, backgroundColor: colors.border, borderRadius: 3 },
  lineActive:      { backgroundColor: colors.green },
  trackerLabels:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  trackerLabel:    { color: colors.muted, fontSize: FontSize.xs, fontWeight: '700' },
  trackerLabelActive: { color: colors.green },
});
