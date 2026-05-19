import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useTheme } from '../../context/ThemeContext';
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Button } from '../../components/ui/Button';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

// ── Mock — substituir por dados reais da rota finalizada ──────────────────────
const RESUMO = {
  entregador: 'João Silva',
  percurso: 'São Paulo - Zona Sul',
  totalEntregas: 12,
  entregasRealizadas: 12,
  falhas: 0,
  tempoTotal: '06h 42m',
  kmRodados: 84.5,
};

// ── Component ─────────────────────────────────────────────────────────────────
export function DriverSummaryScreen({ navigation }: { navigation: any }) {
  const s = useThemedStyles(buildStyles);
  const { colors } = useTheme();

  const taxaSucesso = Math.round((RESUMO.entregasRealizadas / RESUMO.totalEntregas) * 100);

  const handleEncerrar = async () => {
    // TODO: await api.put(`/api/v1/routes/${routeId}/complete`)
    navigation.reset({ index: 0, routes: [{ name: 'DriverRoute' }] });
  };

  return (
    <View style={s.container}>
      <TopBar title="Resumo da Jornada" />

      <ScrollView contentContainerStyle={s.list}>

        {/* Ícone de sucesso */}
        <View style={s.successWrap}>
          <View style={s.successIcon}>
            <Text style={{ fontSize: 40 }}>✅</Text>
          </View>
          <Text style={s.successTitle}>Rota Concluída com Sucesso!</Text>
          <Text style={s.successSub}>
            Excelente trabalho, {RESUMO.entregador}. Todas as entregas foram finalizadas.
          </Text>
        </View>

        {/* Percurso */}
        <View style={s.card}>
          <Text style={s.percursoLabel}>PERCURSO FINALIZADO</Text>
          <Text style={s.percursoVal}>{RESUMO.percurso}</Text>
        </View>

        {/* Métricas */}
        <Text style={s.sectionLabel}>— RESUMO DO DIA</Text>
        <View style={s.metricasGrid}>
          <View style={s.metricaCard}>
            <Text style={{ fontSize: 24 }}>📦</Text>
            <Text style={s.metricaVal}>{RESUMO.entregasRealizadas}/{RESUMO.totalEntregas}</Text>
            <Text style={s.metricaLabel}>Entregas</Text>
          </View>
          <View style={s.metricaCard}>
            <Text style={{ fontSize: 24 }}>⏱️</Text>
            <Text style={s.metricaVal}>{RESUMO.tempoTotal}</Text>
            <Text style={s.metricaLabel}>Tempo Total</Text>
          </View>
          <View style={s.metricaCard}>
            <Text style={{ fontSize: 24 }}>📍</Text>
            <Text style={s.metricaVal}>{RESUMO.kmRodados} km</Text>
            <Text style={s.metricaLabel}>KM Rodados</Text>
          </View>
          <View style={s.metricaCard}>
            <Text style={{ fontSize: 24 }}>✅</Text>
            <Text style={[s.metricaVal, { color: taxaSucesso === 100 ? colors.green : colors.warning }]}>
              {taxaSucesso}%
            </Text>
            <Text style={s.metricaLabel}>Taxa de Sucesso</Text>
          </View>
        </View>

        {/* Barra de progresso */}
        <View style={s.card}>
          <View style={s.progressRow}>
            <Text style={s.progressLabel}>Entregas realizadas</Text>
            <Text style={s.progressVal}>{RESUMO.entregasRealizadas}/{RESUMO.totalEntregas}</Text>
          </View>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${taxaSucesso}%` as any }]} />
          </View>
          {RESUMO.falhas > 0 && (
            <Text style={s.falhasLabel}>{RESUMO.falhas} entrega(s) com falha</Text>
          )}
        </View>

        <TouchableOpacity onPress={() => {}}>
          <Text style={s.verDetalhes}>Ver detalhes da rota →</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Rodapé */}
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

// ── Styles ────────────────────────────────────────────────────────────────────
const buildStyles = (c: import('../../theme').ColorPalette) => ({
  container:      { flex: 1, backgroundColor: c.bg },
  list:           { padding: Spacing.xl, gap: 14 },
  sectionLabel:   { fontSize: FontSize.xs, fontWeight: '700', color: c.green, letterSpacing: 1.2 },

  successWrap:    { alignItems: 'center', gap: 10, paddingVertical: Spacing.lg },
  successIcon:    { width: 80, height: 80, borderRadius: 40, backgroundColor: `${c.green}22`, borderWidth: 2, borderColor: c.green, alignItems: 'center', justifyContent: 'center' },
  successTitle:   { color: c.text, fontWeight: '800', fontSize: FontSize.lg, textAlign: 'center' },
  successSub:     { color: c.muted, fontSize: FontSize.sm, textAlign: 'center', lineHeight: 22 },

  card:           { backgroundColor: c.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: c.border, gap: 8 },
  percursoLabel:  { color: c.muted, fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 1 },
  percursoVal:    { color: c.text, fontWeight: '800', fontSize: FontSize.xl },

  metricasGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricaCard:    { flex: 1, minWidth: '45%', backgroundColor: c.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: c.border, alignItems: 'center', gap: 6 },
  metricaVal:     { color: c.green, fontWeight: '900', fontSize: FontSize.lg },
  metricaLabel:   { color: c.muted, fontSize: FontSize.xs },

  progressRow:    { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel:  { color: c.muted, fontSize: FontSize.sm },
  progressVal:    { color: c.text, fontWeight: '700', fontSize: FontSize.sm },
  progressBar:    { height: 8, backgroundColor: c.subtle, borderRadius: 4, overflow: 'hidden' },
  progressFill:   { height: '100%', backgroundColor: c.green, borderRadius: 4 },
  falhasLabel:    { color: c.danger, fontSize: FontSize.xs },

  verDetalhes:    { color: c.green, fontSize: FontSize.sm, fontWeight: '700', textAlign: 'center' },

  footer:         { padding: Spacing.xl, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.surface },
});
