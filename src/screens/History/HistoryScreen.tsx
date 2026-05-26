import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { ColorPalette, FontSize, Radius, Spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { DeliveryOrder, useDelivery } from '../../context/DeliveryContext';

const STATUS_TONE: Record<string, keyof Pick<ColorPalette, 'green' | 'danger' | 'warning'>> = {
  entregue: 'green', DELIVERED: 'green', delivered: 'green',
  cancelado: 'danger', CANCELLED: 'danger', REJECTED: 'danger',
  pendente: 'warning', PENDING: 'warning', ACCEPTED: 'warning', confirmed: 'warning', route: 'warning',
  PREPARING: 'warning', DISPATCHED: 'warning',
};
const STATUS_ICON: Record<string, string> = {
  entregue: '✓', DELIVERED: '✓', delivered: '✓',
  cancelado: '✕', CANCELLED: '✕', REJECTED: '✕',
  pendente: '⏱', PENDING: '⏱', ACCEPTED: '⏱', confirmed: '⏱', PREPARING: '⏱', route: '🚚', DISPATCHED: '🚚',
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente', ACCEPTED: 'Aceito', PREPARING: 'Em preparo',
  DISPATCHED: 'Enviado', DELIVERED: 'Entregue', CANCELLED: 'Cancelado', REJECTED: 'Rejeitado',
  confirmed: 'Confirmado', route: 'Em rota', delivered: 'Entregue',
};

const toHistoryOrder = (order: DeliveryOrder) => {
  const firstItem = order.items[0];

  return {
    id: order.id,
    fornecedor: firstItem?.fornecedor ?? 'Fornecedor',
    createdAt: order.createdAt,
    status: order.status,
    total: order.total,
    items: order.items.map(item => ({
      productName: item.nome,
      nome: item.nome,
    })),
  };
};

export function HistoryScreen({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const { orders } = useDelivery();
  const s = React.useMemo(() => createStyles(colors), [colors]);
  const [pedidos, setPedidos]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [erro, setErro]         = useState(false);

  useEffect(() => {
    async function loadOrders() {
      try {
        const { data } = await api.get('/api/v1/orders');
        const list = Array.isArray(data) ? data : data.content ?? data.orders ?? [];
        setPedidos(list);
      } catch {
        setErro(true);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const normalizeStatus = (p: any) =>
    p.status ?? (p.entregue ? 'entregue' : 'pendente');

  const pedidosLocais = React.useMemo(() => orders.map(toHistoryOrder), [orders]);
  const pedidosHistorico = React.useMemo(() => {
    const seen = new Set<string>();

    return [...pedidosLocais, ...pedidos].filter(p => {
      const key = String(p.id ?? p.orderId ?? '');
      if (!key || !seen.has(key)) {
        if (key) seen.add(key);
        return true;
      }

      return false;
    });
  }, [pedidosLocais, pedidos]);

  return (
    <View style={s.container}>
      <TopBar title="Histórico de Pedidos" onBack={() => navigation.goBack()} />
      {loading ? (
        <View style={s.center}><ActivityIndicator color={colors.green} size="large" /></View>
      ) : erro && pedidosHistorico.length === 0 ? (
        <View style={s.center}>
          <Text style={{ color: colors.muted }}>Não foi possível carregar os pedidos.</Text>
        </View>
      ) : (
        <FlatList
          data={pedidosHistorico}
          keyExtractor={i => String(i.id)}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📦</Text>
              <Text style={{ color: colors.muted }}>Nenhum pedido encontrado.</Text>
            </View>
          }
          renderItem={({ item: p }) => {
            const status = normalizeStatus(p);
            const statusTone = STATUS_TONE[status];
            const statusColor = statusTone ? colors[statusTone] : colors.muted;
            const statusIcon  = STATUS_ICON[status]  ?? (status === 'route' ? '>>' : '...');
            const statusLabel = STATUS_LABEL[status]  ?? status;

            // normaliza campos da API
            const id         = p.id ?? p.orderId ?? '-';
            const fornecedor = p.supplierName ?? p.supplier?.name ?? p.fornecedor ?? '-';
            const data_fmt   = p.createdAt
              ? new Date(p.createdAt).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })
              : (p.data ?? '-');
            const total      = typeof p.totalAmount === 'number'
              ? `R$ ${p.totalAmount.toFixed(2)}`
              : (typeof p.total === 'number' ? `R$ ${p.total.toFixed(2)}` : (p.total ?? '-'));
            const itens: string[] = p.items?.map((i: any) => i.productName ?? i.nome ?? 'Item') ?? p.itens ?? [];

            return (
              <View style={s.card}>
                <View style={s.top}>
                  <Text style={s.id}>#{typeof id === 'number' ? id : id.toString().replace('#','')}</Text>
                  <View style={[s.badge, { backgroundColor: `${statusColor}22` }]}>
                    <Text style={[s.badgeTxt, { color: statusColor }]}>
                      {statusIcon} {statusLabel}
                    </Text>
                  </View>
                </View>
                <Text style={s.meta}>{fornecedor} · {data_fmt}</Text>
                {itens.length > 0 && <Text style={s.itens}>{itens.join(' · ')}</Text>}
                <View style={s.footer}>
                  <Text style={s.total}>{total}</Text>
                  {(status === 'entregue' || status === 'DELIVERED' || status === 'delivered') && (
                    <TouchableOpacity style={s.repeatBtn}>
                      <Text style={s.repeatTxt}>Repetir pedido</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
            <Text style={s.meta}>{p.fornecedor} · {p.data}</Text>
            <Text style={s.itens}>{p.itens.join(' · ')}</Text>
            <View style={s.footer}>
              <Text style={s.total}>{p.total}</Text>
              {p.status === 'entregue' && (
                <TouchableOpacity style={s.repeatBtn}>
                  <Text style={s.repeatTxt}>Repetir pedido</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list:      { padding: Spacing.xl, gap: 12 },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  card:      { backgroundColor: colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: colors.border },
  top:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  id:        { fontWeight: '800', color: colors.text, fontSize: FontSize.base },
  badge:     { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  badgeTxt:  { fontSize: FontSize.xs, fontWeight: '700' },
  meta:      { color: colors.muted, fontSize: FontSize.sm },
  itens:     { color: colors.muted, fontSize: FontSize.xs, marginBottom: 12 },
  footer:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total:     { color: colors.green, fontWeight: '800', fontSize: FontSize.base },
  repeatBtn: { backgroundColor: `${colors.green}22`, borderWidth: 1, borderColor: `${colors.green}44`, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  repeatTxt: { color: colors.green, fontWeight: '700', fontSize: FontSize.xs },
});
