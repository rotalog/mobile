import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useTheme } from '../../context/ThemeContext';
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { FontSize, Radius, Spacing } from '../../theme';
import { api } from '../../services/api';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Rota {
  id: string;
  data: string;
  origem: string;
  totalEntregas: number;
  entregues: number;
  falhas: number;
  status: string;
}

// ── Filtros ───────────────────────────────────────────────────────────────────
const FILTROS = ['Todos', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const STATUS_LABEL: Record<string, string> = {
  COMPLETED:   'Concluída',
  IN_PROGRESS: 'Em andamento',
  CANCELLED:   'Cancelada',
};

// ── Mock pra quando API não tiver dados ───────────────────────────────────────
const MOCK_ROTAS: Rota[] = [
  { id: '1', data: '17 Mai 2026', origem: 'Manaus - Centro',    totalEntregas: 12, entregues: 12, falhas: 0, status: 'COMPLETED'   },
  { id: '2', data: '16 Mai 2026', origem: 'Manaus - Zona Sul',  totalEntregas: 8,  entregues: 7,  falhas: 1, status: 'COMPLETED'   },
  { id: '3', data: '15 Mai 2026', origem: 'Manaus - Chapada',   totalEntregas: 10, entregues: 9,  falhas: 1, status: 'COMPLETED'   },
  { id: '4', data: '14 Mai 2026', origem: 'Manaus - Aleixo',    totalEntregas: 6,  entregues: 6,  falhas: 0, status: 'COMPLETED'   },
];

// ── Component ─────────────────────────────────────────────────────────────────
export function DriverHistoryScreen({ navigation }: { navigation: any }) {
  const s = useThemedStyles(buildStyles);
  const { colors } = useTheme();

  const STATUS_COLOR: Record<string, string> = {
    COMPLETED: colors.green,
    IN_PROGRESS: colors.warning,
    CANCELLED: colors.danger,
  };

  const [rotas, setRotas]       = useState<Rota[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filtroMes, setFiltroMes] = useState('Todos');
  const [filtroAno, setFiltroAno] = useState('2026');

  useEffect(() => {
    async function carregarHistorico() {
      try {
        // GET /api/v1/routes com filtros de data
        const params: any = {};
        if (filtroMes !== 'Todos') params.month = FILTROS.indexOf(filtroMes);
        if (filtroAno) params.year = filtroAno;

        const { data } = await api.get('/api/v1/routes', { params });

        setRotas(data.map((r: any) => ({
          id:             r.id,
          data:           r.date ?? r.createdAt ?? '',
          origem:         r.origin ?? 'Manaus - AM',
          totalEntregas:  r.totalPoints ?? 0,
          entregues:      r.deliveredCount ?? 0,
          falhas:         r.failedCount ?? 0,
          status:         r.status ?? 'COMPLETED',
        })));
      } catch {
        // Usa mock se API não tiver dados ainda
        setRotas(MOCK_ROTAS);
      } finally {
        setLoading(false);
      }
    }
    carregarHistorico();
  }, [filtroMes, filtroAno]);

  const ANOS = ['2024', '2025', '2026'];

  return (
    <View style={s.container}>
      <TopBar title="Histórico de Rotas" onBack={() => navigation.goBack()} />

      {/* Filtro de ano */}
      <View style={s.anoRow}>
        {ANOS.map(a => (
          <TouchableOpacity
            key={a}
            style={[s.anoChip, filtroAno === a && s.anoChipActive]}
            onPress={() => setFiltroAno(a)}
          >
            <Text style={[s.anoTxt, filtroAno === a && s.anoTxtActive]}>{a}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filtro de mês */}
      <FlatList
        horizontal
        data={FILTROS}
        keyExtractor={f => f}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.mesRow}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[s.mesChip, filtroMes === f && s.mesChipActive]}
            onPress={() => setFiltroMes(f)}
          >
            <Text style={[s.mesTxt, filtroMes === f && s.mesTxtActive]}>{f}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Lista de rotas */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.green} size="large" />
        </View>
      ) : rotas.length === 0 ? (
        <View style={s.center}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>📭</Text>
          <Text style={s.emptyTxt}>Nenhuma rota encontrada.</Text>
        </View>
      ) : (
        <FlatList
          data={rotas}
          keyExtractor={r => r.id}
          contentContainerStyle={s.list}
          renderItem={({ item: r }) => (
            <TouchableOpacity style={s.card} activeOpacity={0.8}>
              <View style={s.cardTop}>
                <View>
                  <Text style={s.cardData}>{r.data}</Text>
                  <Text style={s.cardOrigem}>{r.origem}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: `${STATUS_COLOR[r.status] ?? colors.muted}22` }]}>
                  <Text style={[s.statusTxt, { color: STATUS_COLOR[r.status] ?? colors.muted }]}>
                    {STATUS_LABEL[r.status] ?? r.status}
                  </Text>
                </View>
              </View>

              <View style={s.metaRow}>
                <View style={s.metaItem}>
                  <Text style={s.metaVal}>{r.totalEntregas}</Text>
                  <Text style={s.metaLabel}>Total</Text>
                </View>
                <View style={s.metaDivider} />
                <View style={s.metaItem}>
                  <Text style={[s.metaVal, { color: colors.green }]}>{r.entregues}</Text>
                  <Text style={s.metaLabel}>Entregues</Text>
                </View>
                <View style={s.metaDivider} />
                <View style={s.metaItem}>
                  <Text style={[s.metaVal, { color: r.falhas > 0 ? colors.danger : colors.muted }]}>{r.falhas}</Text>
                  <Text style={s.metaLabel}>Falhas</Text>
                </View>
                <View style={s.metaDivider} />
                <View style={s.metaItem}>
                  <Text style={[s.metaVal, { color: colors.green }]}>
                    {r.totalEntregas > 0 ? `${Math.round((r.entregues / r.totalEntregas) * 100)}%` : '-'}
                  </Text>
                  <Text style={s.metaLabel}>Taxa</Text>
                </View>
              </View>

              {/* Barra de progresso */}
              <View style={s.progressBar}>
                <View style={[s.progressFill, {
                  width: `${r.totalEntregas > 0 ? (r.entregues / r.totalEntregas) * 100 : 0}%` as any
                }]} />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const buildStyles = (c: import('../../theme').ColorPalette) => ({
  container:    { flex: 1, backgroundColor: c.bg },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTxt:     { color: c.muted, fontSize: FontSize.base },

  anoRow:       { flexDirection: 'row', gap: 8, padding: Spacing.xl, paddingBottom: 0 },
  anoChip:      { flex: 1, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1, borderColor: c.border, alignItems: 'center', backgroundColor: c.card },
  anoChipActive:{ backgroundColor: c.green, borderColor: c.green },
  anoTxt:       { color: c.muted, fontWeight: '700', fontSize: FontSize.sm },
  anoTxtActive: { color: '#0A0C0E' },

  mesRow:       { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, gap: 8 },
  mesChip:      { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: c.border, backgroundColor: c.card },
  mesChipActive:{ backgroundColor: c.green, borderColor: c.green },
  mesTxt:       { color: c.muted, fontWeight: '700', fontSize: FontSize.xs },
  mesTxtActive: { color: '#0A0C0E' },

  list:         { padding: Spacing.xl, gap: 12 },
  card:         { backgroundColor: c.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: c.border, gap: 12 },
  cardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardData:     { color: c.text, fontWeight: '800', fontSize: FontSize.base },
  cardOrigem:   { color: c.muted, fontSize: FontSize.sm, marginTop: 2 },

  statusBadge:  { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  statusTxt:    { fontSize: FontSize.xs, fontWeight: '700' },

  metaRow:      { flexDirection: 'row', backgroundColor: c.subtle, borderRadius: Radius.md, padding: Spacing.md },
  metaItem:     { flex: 1, alignItems: 'center' },
  metaVal:      { color: c.text, fontWeight: '800', fontSize: FontSize.base },
  metaLabel:    { color: c.muted, fontSize: FontSize.xs, marginTop: 2 },
  metaDivider:  { width: 1, backgroundColor: c.border },

  progressBar:  { height: 6, backgroundColor: c.subtle, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: c.green, borderRadius: 3 },
});
