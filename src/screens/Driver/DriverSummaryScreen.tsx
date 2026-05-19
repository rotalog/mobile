import React, { useEffect, useMemo, useState } from 'react';
import { Alert, View, Text, ScrollView, StyleSheet } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Button } from '../../components/ui/Button';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { api } from '../../services/api';

interface BackendRoutePoint {
  id: string | number;
  status?: string | null;
}

const ACTIONABLE_POINT_STATUSES = new Set(['PENDING', 'ARRIVED']);

function buildSummary(points: BackendRoutePoint[]) {
  const total = points.length;
  const completed = points.filter((point) => point.status === 'COMPLETED').length;
  const failed = points.filter((point) => point.status === 'FAILED').length;
  const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    failed,
    successRate,
  };
}

export function DriverSummaryScreen({ navigation, route }: { navigation: any; route?: any }) {
  const routeId = route?.params?.routeId;
  const [points, setPoints] = useState<BackendRoutePoint[]>([]);
  const [summary, setSummary] = useState(() => buildSummary([]));
  const [loadError, setLoadError] = useState('');
  const [isLoadingPoints, setIsLoadingPoints] = useState(Boolean(routeId));

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      if (!routeId) {
        if (active) {
          setIsLoadingPoints(false);
          setLoadError('');
          setPoints([]);
          setSummary(buildSummary([]));
        }
        return;
      }

      if (active) {
        setIsLoadingPoints(true);
      }

      try {
        const { data } = await api.get(`/api/v1/routes/${routeId}/points`);
        if (active) {
          const nextPoints = Array.isArray(data) ? data : [];
          setLoadError('');
          setPoints(nextPoints);
          setSummary(buildSummary(nextPoints));
        }
      } catch {
        if (active) {
          setLoadError('Não foi possível carregar os pontos desta rota.');
          setPoints([]);
          setSummary(buildSummary([]));
        }
      } finally {
        if (active) {
          setIsLoadingPoints(false);
        }
      }
    }

    loadSummary();

    return () => {
      active = false;
    };
  }, [routeId]);

  const progressWidth = useMemo(() => `${summary.successRate}%` as const, [summary.successRate]);
  const hasActionableStops = points.some((point) => ACTIONABLE_POINT_STATUSES.has(point.status ?? ''));

  const handleEncerrar = async () => {
    if (!routeId) {
      navigation.reset({ index: 0, routes: [{ name: 'DriverRoute' }] });
      return;
    }

    if (isLoadingPoints) {
      Alert.alert('Atenção', 'Aguarde o carregamento dos pontos antes de encerrar o expediente.');
      return;
    }

    if (loadError) {
      Alert.alert('Erro', 'Recarregue os pontos da rota antes de encerrar o expediente.');
      return;
    }

    if (hasActionableStops) {
      Alert.alert('Atenção', 'Ainda existem paradas pendentes nesta rota.');
      return;
    }

    try {
      await api.put(`/api/v1/routes/${routeId}/complete`);
      navigation.reset({ index: 0, routes: [{ name: 'DriverRoute' }] });
    } catch {
      Alert.alert('Erro', 'Não foi possível concluir a rota. Tente novamente.');
    }
  };

  return (
    <View style={s.container}>
      <TopBar title="Resumo da Jornada" />

      <ScrollView contentContainerStyle={s.list}>
        <View style={s.successWrap}>
          <View style={s.successIcon}>
            <Text style={{ fontSize: 40 }}>✅</Text>
          </View>
          <Text style={s.successTitle}>Rota concluída</Text>
          <Text style={s.successSub}>
            Resumo baseado nos pontos sincronizados para esta rota.
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.percursoLabel}>ROTA</Text>
          <Text style={s.percursoVal}>{routeId ? `#${routeId}` : '--'}</Text>
        </View>

        <Text style={s.sectionLabel}>— RESUMO DO DIA</Text>
        <View style={s.metricasGrid}>
          <View style={s.metricaCard}>
            <Text style={{ fontSize: 24 }}>📦</Text>
            <Text style={s.metricaVal}>{summary.total}</Text>
            <Text style={s.metricaLabel}>Total</Text>
          </View>
          <View style={s.metricaCard}>
            <Text style={{ fontSize: 24 }}>✅</Text>
            <Text style={[s.metricaVal, { color: summary.completed > 0 ? Colors.green : Colors.text }]}>{summary.completed}</Text>
            <Text style={s.metricaLabel}>Concluídas</Text>
          </View>
          <View style={s.metricaCard}>
            <Text style={{ fontSize: 24 }}>❌</Text>
            <Text style={[s.metricaVal, { color: summary.failed > 0 ? Colors.danger : Colors.text }]}>{summary.failed}</Text>
            <Text style={s.metricaLabel}>Falhas</Text>
          </View>
          <View style={s.metricaCard}>
            <Text style={{ fontSize: 24 }}>⏱️</Text>
            <Text style={s.metricaVal}>--</Text>
            <Text style={s.metricaLabel}>Tempo Total</Text>
          </View>
        </View>

        <View style={s.card}>
          {loadError ? (
            <Text style={s.errorLabel}>{loadError}</Text>
          ) : (
            <>
              <View style={s.progressRow}>
                <Text style={s.progressLabel}>Entregas realizadas</Text>
                <Text style={s.progressVal}>{summary.completed}/{summary.total}</Text>
              </View>
              <View style={s.progressBar}>
                <View style={[s.progressFill, { width: progressWidth }]} />
              </View>
              {summary.failed > 0 && (
                <Text style={s.falhasLabel}>{summary.failed} entrega(s) com falha</Text>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <View style={s.footer}>
        <Button
          label="ENCERRAR EXPEDIENTE"
          onPress={handleEncerrar}
          full
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  list: { padding: Spacing.xl, gap: 14 },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.green, letterSpacing: 1.2 },

  successWrap: { alignItems: 'center', gap: 10, paddingVertical: Spacing.lg },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: `${Colors.green}22`, borderWidth: 2, borderColor: Colors.green, alignItems: 'center', justifyContent: 'center' },
  successTitle: { color: Colors.text, fontWeight: '800', fontSize: FontSize.lg, textAlign: 'center' },
  successSub: { color: Colors.muted, fontSize: FontSize.sm, textAlign: 'center', lineHeight: 22 },

  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: 8 },
  percursoLabel: { color: Colors.muted, fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 1 },
  percursoVal: { color: Colors.text, fontWeight: '800', fontSize: FontSize.xl },

  metricasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricaCard: { flex: 1, minWidth: '45%', backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', gap: 6 },
  metricaVal: { color: Colors.green, fontWeight: '900', fontSize: FontSize.lg },
  metricaLabel: { color: Colors.muted, fontSize: FontSize.xs },

  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { color: Colors.muted, fontSize: FontSize.sm },
  progressVal: { color: Colors.text, fontWeight: '700', fontSize: FontSize.sm },
  progressBar: { height: 8, backgroundColor: Colors.subtle, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.green, borderRadius: 4 },
  falhasLabel: { color: Colors.danger, fontSize: FontSize.xs },
  errorLabel: { color: Colors.danger, fontSize: FontSize.sm, textAlign: 'center', lineHeight: 22 },

  verDetalhes: { color: Colors.green, fontSize: FontSize.sm, fontWeight: '700', textAlign: 'center' },

  footer: { padding: Spacing.xl, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
});
