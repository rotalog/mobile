import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
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

interface BackendHistoryRoute {
  id: string | number;
  createdAt?: string;
  origin?: string | null;
  totalPoints?: number | null;
  deliveredCount?: number | null;
  failedCount?: number | null;
  status?: string | null;
}

// ── Filtros ───────────────────────────────────────────────────────────────────
const FILTROS = ['Todos', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatRouteDate(createdAt?: string) {
  if (!createdAt) {
    return '';
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = FILTROS[date.getUTCMonth() + 1] ?? '';
  const year = date.getUTCFullYear();

  return `${day} ${month} ${year}`.trim();
}

const STATUS_COLOR: Record<string, string> = {
  PLANNED: Colors.warning,
  STARTED: Colors.warning,
  COMPLETED: Colors.green,
  CANCELLED: Colors.danger,
};

const STATUS_LABEL: Record<string, string> = {
  PLANNED: 'Planejada',
  STARTED: 'Em andamento',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};

// ── Component ─────────────────────────────────────────────────────────────────
export function DriverHistoryScreen({ navigation }: { navigation: any }) {
  const [rotas, setRotas]       = useState<Rota[]>([]);
  const [loading, setLoading]   = useState(true);
  const [erro, setErro]         = useState('');
  const [filtroMes, setFiltroMes] = useState('Todos');
  const [filtroAno, setFiltroAno] = useState('2026');

  useEffect(() => {
    async function carregarHistorico() {
      try {
        setErro('');
        // GET /api/v1/routes com filtros de data
        const params: any = {};
        if (filtroMes !== 'Todos') params.month = FILTROS.indexOf(filtroMes);
        if (filtroAno) params.year = filtroAno;

        const { data } = await api.get('/api/v1/routes', { params });

        setRotas((Array.isArray(data) ? data : []).map((r: BackendHistoryRoute) => ({
          id:             String(r.id),
          data:           formatRouteDate(r.createdAt),
          origem:         r.origin?.trim() || 'Origem não disponível',
          totalEntregas:  r.totalPoints ?? 0,
          entregues:      r.deliveredCount ?? 0,
          falhas:         r.failedCount ?? 0,
          status:         r.status ?? 'COMPLETED',
        })));
      } catch {
        setRotas([]);
        setErro('Não foi possível carregar o histórico de rotas.');
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
          <ActivityIndicator color={Colors.green} size="large" />
        </View>
      ) : rotas.length === 0 ? (
        <View style={s.center}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>📭</Text>
          <Text style={s.emptyTxt}>{erro || 'Nenhuma rota encontrada.'}</Text>
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
                <View style={[s.statusBadge, { backgroundColor: `${STATUS_COLOR[r.status] ?? Colors.muted}22` }]}>
                  <Text style={[s.statusTxt, { color: STATUS_COLOR[r.status] ?? Colors.muted }]}>
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
                  <Text style={[s.metaVal, { color: Colors.green }]}>{r.entregues}</Text>
                  <Text style={s.metaLabel}>Entregues</Text>
                </View>
                <View style={s.metaDivider} />
                <View style={s.metaItem}>
                  <Text style={[s.metaVal, { color: r.falhas > 0 ? Colors.danger : Colors.muted }]}>{r.falhas}</Text>
                  <Text style={s.metaLabel}>Falhas</Text>
                </View>
                <View style={s.metaDivider} />
                <View style={s.metaItem}>
                  <Text style={[s.metaVal, { color: Colors.green }]}>
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
const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.bg },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTxt:     { color: Colors.muted, fontSize: FontSize.base },

  anoRow:       { flexDirection: 'row', gap: 8, padding: Spacing.xl, paddingBottom: 0 },
  anoChip:      { flex: 1, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', backgroundColor: Colors.card },
  anoChipActive:{ backgroundColor: Colors.green, borderColor: Colors.green },
  anoTxt:       { color: Colors.muted, fontWeight: '700', fontSize: FontSize.sm },
  anoTxtActive: { color: '#0A0C0E' },

  mesRow:       { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, gap: 8 },
  mesChip:      { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  mesChipActive:{ backgroundColor: Colors.green, borderColor: Colors.green },
  mesTxt:       { color: Colors.muted, fontWeight: '700', fontSize: FontSize.xs },
  mesTxtActive: { color: '#0A0C0E' },

  list:         { padding: Spacing.xl, gap: 12 },
  card:         { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: 12 },
  cardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardData:     { color: Colors.text, fontWeight: '800', fontSize: FontSize.base },
  cardOrigem:   { color: Colors.muted, fontSize: FontSize.sm, marginTop: 2 },

  statusBadge:  { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  statusTxt:    { fontSize: FontSize.xs, fontWeight: '700' },

  metaRow:      { flexDirection: 'row', backgroundColor: Colors.subtle, borderRadius: Radius.md, padding: Spacing.md },
  metaItem:     { flex: 1, alignItems: 'center' },
  metaVal:      { color: Colors.text, fontWeight: '800', fontSize: FontSize.base },
  metaLabel:    { color: Colors.muted, fontSize: FontSize.xs, marginTop: 2 },
  metaDivider:  { width: 1, backgroundColor: Colors.border },

  progressBar:  { height: 6, backgroundColor: Colors.subtle, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.green, borderRadius: 3 },
});