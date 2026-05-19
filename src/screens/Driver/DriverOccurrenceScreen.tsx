import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useTheme } from '../../context/ThemeContext';
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Button } from '../../components/ui/Button';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

// ── Motivos de falha ──────────────────────────────────────────────────────────
const MOTIVOS = [
  { key: 'CLOSED',           icon: '🔒', label: 'Local Fechado',          sub: 'Estabelecimento ou condomínio não permite entrada' },
  { key: 'ADDRESS_NOT_FOUND',icon: '🗺️', label: 'Endereço Não Localizado', sub: 'Numeração ou rua não encontrada no mapa'            },
  { key: 'CUSTOMER_ABSENT',  icon: '🔕', label: 'Cliente Ausente',         sub: 'Ninguém atendeu ao interfone ou portão'             },
  { key: 'REFUSED',          icon: '❌', label: 'Recusado pelo Cliente',   sub: 'Produto avariado ou pedido não reconhecido'          },
];

// ── Component ─────────────────────────────────────────────────────────────────
export function DriverOccurrenceScreen({ navigation, route }: { navigation: any; route: any }) {
  const s = useThemedStyles(buildStyles);
  const { colors } = useTheme();

  const ponto = route?.params?.ponto ?? { id: '1' };

  const [motivoSelecionado, setMotivoSelecionado] = useState('');
  const [observacao, setObservacao]               = useState('');
  const [loading, setLoading]                     = useState(false);

  const handleConfirmar = async () => {
    if (!motivoSelecionado) {
      Alert.alert('Atenção', 'Selecione o motivo da ocorrência.');
      return;
    }
    setLoading(true);
    try {
      // TODO: await api.put(`/api/v1/delivery-points/${ponto.id}/fail`, {
      //   reason: motivoSelecionado,
      //   notes: observacao,
      // })
      await new Promise(r => setTimeout(r, 1000));
      navigation.navigate('DriverRoute');
    } catch {
      Alert.alert('Erro', 'Não foi possível registrar a ocorrência.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <TopBar title="Ocorrência" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={s.list}>

        <Text style={s.titulo}>Por que não foi possível entregar?</Text>
        <Text style={s.subtitulo}>Selecione o motivo principal para registrar o insucesso desta entrega.</Text>

        {/* Motivos */}
        {MOTIVOS.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[s.motivoCard, motivoSelecionado === m.key && s.motivoCardActive]}
            onPress={() => setMotivoSelecionado(m.key)}
            activeOpacity={0.8}
          >
            <View style={[s.radio, motivoSelecionado === m.key && s.radioActive]}>
              {motivoSelecionado === m.key && <View style={s.radioDot} />}
            </View>
            <Text style={{ fontSize: 20 }}>{m.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.motivoLabel, motivoSelecionado === m.key && { color: colors.text }]}>
                {m.label}
              </Text>
              <Text style={s.motivoSub}>{m.sub}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Observações */}
        <Text style={s.sectionLabel}>— OBSERVAÇÕES (OPCIONAL)</Text>
        <View style={s.obsBox}>
          <TextInput
            value={observacao}
            onChangeText={setObservacao}
            placeholder="Adicione detalhes relevantes sobre o ocorrido..."
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={4}
            maxLength={250}
            style={s.obsInput}
          />
          <Text style={s.obsCount}>{observacao.length}/250 caracteres</Text>
        </View>

      </ScrollView>

      {/* Rodapé */}
      <View style={s.footer}>
        <Button
          label="CONFIRMAR OCORRÊNCIA"
          onPress={handleConfirmar}
          loading={loading}
          variant="danger"
          full
        />
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const buildStyles = (c: import('../../theme').ColorPalette) => ({
  container:       { flex: 1, backgroundColor: c.bg },
  list:            { padding: Spacing.xl, gap: 12 },

  titulo:          { color: c.text, fontWeight: '800', fontSize: FontSize.lg },
  subtitulo:       { color: c.muted, fontSize: FontSize.sm, lineHeight: 20 },
  sectionLabel:    { fontSize: FontSize.xs, fontWeight: '700', color: c.green, letterSpacing: 1.2 },

  motivoCard:      { backgroundColor: c.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: c.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  motivoCardActive:{ borderColor: c.green },
  motivoLabel:     { color: c.muted, fontWeight: '600', fontSize: FontSize.sm, marginBottom: 2 },
  motivoSub:       { color: c.muted, fontSize: FontSize.xs, lineHeight: 16 },

  radio:           { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioActive:     { borderColor: c.green },
  radioDot:        { width: 10, height: 10, borderRadius: 5, backgroundColor: c.green },

  obsBox:          { backgroundColor: c.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: c.border, padding: Spacing.md },
  obsInput:        { color: c.text, fontSize: FontSize.sm, minHeight: 100, textAlignVertical: 'top' },
  obsCount:        { color: c.muted, fontSize: FontSize.xs, textAlign: 'right', marginTop: 6 },

  footer:          { padding: Spacing.xl, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.surface },
});
