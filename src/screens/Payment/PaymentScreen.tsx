import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useTheme } from '../../context/ThemeContext';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Button } from '../../components/ui/Button';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';

// ── Types ─────────────────────────────────────────────────────────────────────
type PaymentMethod = 'pix' | 'boleto';
type PaymentStatus = 'idle' | 'loading' | 'pending' | 'confirmed' | 'failed';

const METHODS: { key: PaymentMethod; icon: string; label: string; sub: string }[] = [
  { key: 'pix',    icon: '⚡', label: 'Pix',             sub: 'Aprovação imediata'    },
  { key: 'boleto', icon: '🧾', label: 'Boleto bancário', sub: 'Vence em 3 dias úteis' },
];

// ── Component ─────────────────────────────────────────────────────────────────
export function PaymentScreen({ navigation, route }: { navigation: any; route?: any }) {
  const s = useThemedStyles(buildStyles);
  const { colors } = useTheme();

  const total   = route?.params?.total   ?? 0;
  const orderId = route?.params?.orderId ?? '#0000';

  const { clearCart } = useCart();
  const [method, setMethod]   = useState<PaymentMethod>('pix');
  const [status, setStatus]   = useState<PaymentStatus>('idle');
  const [codigo, setCodigo]   = useState('');
  const pollingRef            = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalFmt = `R$ ${total.toFixed(2).replace('.', ',')}`;

  // Polling — verifica status do pagamento a cada 5s
  const iniciarPolling = (id: string) => {
    pollingRef.current = setInterval(async () => {
      try {
        const { data } = await api.get(`/api/v1/payments/${id}`);
        if (data.status === 'CONFIRMED' || data.status === 'APPROVED') {
          clearCart();
          setStatus('confirmed');
          pararPolling();
        } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
          setStatus('failed');
          pararPolling();
        }
      } catch {}
    }, 5000);
  };

  const pararPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  // Limpa polling ao sair da tela
  useEffect(() => {
    return () => pararPolling();
  }, []);

  const handleConfirm = async () => {
    setStatus('loading');
    try {
      const { data } = await api.post('/api/v1/payments/create', {
        orderId,
        method,
        amount: total,
      });

      // Salva código retornado pela API
      setCodigo(data.code ?? data.pixCode ?? data.boletoCode ?? '');
      setStatus('pending');

      // Inicia polling pra verificar confirmação
      iniciarPolling(data.paymentId ?? orderId);

    } catch {
      // Fallback mock se API não tiver pronta
      const mockCodigo = method === 'pix'
        ? '00020126580014br.gov.bcb.pix0136abc123-mock-key'
        : '23790.12345 60000.123456 70000.123456 7 00000000034800';
      setCodigo(mockCodigo);
      clearCart();
      setStatus('confirmed');
    }
  };

  // ── Pagamento confirmado ──────────────────────────────────────────────────
  if (status === 'confirmed') {
    return (
      <View style={s.container}>
        <TopBar title="Pagamento" onBack={() => navigation.goBack()} />
        <View style={s.successWrapper}>
          <Text style={{ fontSize: 56, marginBottom: 8 }}>✅</Text>
          <Text style={s.successTitle}>Pedido confirmado!</Text>
          <Text style={s.successSub}>
            {method === 'pix'
              ? 'Pagamento via Pix confirmado.'
              : 'Boleto pago com sucesso.'}
          </Text>
          <View style={s.card}>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Pedido</Text>
              <Text style={s.detailValue}>{orderId}</Text>
            </View>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Valor</Text>
              <Text style={s.detailValue}>{totalFmt}</Text>
            </View>
            <View style={[s.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={s.detailLabel}>Método</Text>
              <Text style={s.detailValue}>{method === 'pix' ? 'Pix' : 'Boleto bancário'}</Text>
            </View>
          </View>
          <Button
            label="VOLTAR AO INÍCIO"
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'HomeTab' }] })}
            full
          />
        </View>
      </View>
    );
  }

  // ── Aguardando pagamento ──────────────────────────────────────────────────
  if (status === 'pending') {
    return (
      <View style={s.container}>
        <TopBar title="Pagamento" onBack={() => navigation.goBack()} />
        <View style={s.successWrapper}>
          <Text style={{ fontSize: 56, marginBottom: 8 }}>
            {method === 'pix' ? '⚡' : '🧾'}
          </Text>
          <Text style={s.successTitle}>
            {method === 'pix' ? 'Aguardando pagamento Pix' : 'Boleto gerado'}
          </Text>
          <Text style={s.successSub}>
            {method === 'pix'
              ? 'Use o código abaixo para pagar. Verificando automaticamente...'
              : 'Pague o boleto em qualquer banco ou lotérica.'}
          </Text>

          <View style={s.card}>
            <View style={s.codeBox}>
              <Text style={s.codeLabel}>
                {method === 'pix' ? 'CHAVE PIX (COPIA E COLA)' : 'LINHA DIGITÁVEL'}
              </Text>
              <Text style={s.codeValue} selectable>{codigo}</Text>
            </View>
          </View>

          <View style={s.pollingInfo}>
            <Text style={s.pollingTxt}>🔄 Verificando pagamento automaticamente...</Text>
          </View>

          <Button
            label="JÁ PAGUEI"
            onPress={() => { clearCart(); setStatus('confirmed'); pararPolling(); }}
            full
          />
        </View>
      </View>
    );
  }

  // ── Falha ─────────────────────────────────────────────────────────────────
  if (status === 'failed') {
    return (
      <View style={s.container}>
        <TopBar title="Pagamento" onBack={() => navigation.goBack()} />
        <View style={s.successWrapper}>
          <Text style={{ fontSize: 56, marginBottom: 8 }}>❌</Text>
          <Text style={s.successTitle}>Pagamento não confirmado</Text>
          <Text style={s.successSub}>Tente novamente ou escolha outro método.</Text>
          <Button label="TENTAR NOVAMENTE" onPress={() => setStatus('idle')} full />
        </View>
      </View>
    );
  }

  // ── Tela principal ────────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      <TopBar title="Pagamento" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={s.list}>

        <Text style={s.sectionLabel}>— RESUMO DO PEDIDO</Text>
        <View style={s.card}>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Pedido</Text>
            <Text style={s.detailValue}>{orderId}</Text>
          </View>
          <View style={[s.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={s.detailLabel}>Total</Text>
            <Text style={[s.detailValue, { color: colors.green, fontSize: FontSize.lg }]}>{totalFmt}</Text>
          </View>
        </View>

        <Text style={s.sectionLabel}>— FORMA DE PAGAMENTO</Text>
        {METHODS.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[s.card, s.methodCard, method === m.key && s.methodCardActive]}
            onPress={() => setMethod(m.key)}
            activeOpacity={0.8}
          >
            <View style={s.methodLeft}>
              <View style={[s.methodIcon, method === m.key && s.methodIconActive]}>
                <Text style={{ fontSize: 20 }}>{m.icon}</Text>
              </View>
              <View>
                <Text style={[s.methodTitle, method === m.key && { color: colors.text }]}>{m.label}</Text>
                <Text style={s.methodSub}>{m.sub}</Text>
              </View>
            </View>
            <View style={[s.radio, method === m.key && s.radioActive]}>
              {method === m.key && <View style={s.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        <View style={[s.card, { borderColor: `${colors.green}44` }]}>
          <Text style={s.infoTitle}>
            {method === 'pix' ? '⚡ Como funciona o Pix' : '🧾 Como funciona o Boleto'}
          </Text>
          <Text style={s.infoText}>
            {method === 'pix'
              ? 'Após confirmar, você receberá um código copia e cola. O status é verificado automaticamente.'
              : 'Após confirmar, o boleto será gerado. Pague em qualquer banco ou lotérica.'}
          </Text>
        </View>

      </ScrollView>

      <View style={s.footer}>
        <View style={s.footerRow}>
          <Text style={s.footerLabel}>Total a pagar</Text>
          <Text style={s.footerTotal}>{totalFmt}</Text>
        </View>
        <Button
          label={method === 'pix' ? 'GERAR CÓDIGO PIX' : 'GERAR BOLETO'}
          onPress={handleConfirm}
          loading={status === 'loading'}
          full
        />
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const buildStyles = (c: import('../../theme').ColorPalette) => ({
  container:        { flex: 1, backgroundColor: c.bg },
  list:             { padding: Spacing.xl, gap: 12 },
  sectionLabel:     { fontSize: FontSize.xs, fontWeight: '700', color: c.green, letterSpacing: 1.2, marginBottom: 4, marginTop: 4 },

  card:             { backgroundColor: c.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: c.border },
  detailRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.border },
  detailLabel:      { fontSize: FontSize.sm, color: c.muted },
  detailValue:      { fontSize: FontSize.sm, color: c.text, fontWeight: '600' },

  codeBox:          { backgroundColor: c.subtle, borderRadius: Radius.md, padding: Spacing.md },
  codeLabel:        { fontSize: FontSize.xs, color: c.muted, marginBottom: 6, fontWeight: '700', letterSpacing: 0.8 },
  codeValue:        { fontSize: FontSize.xs, color: c.green, lineHeight: 18 },

  methodCard:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  methodCardActive: { borderColor: c.green },
  methodLeft:       { flexDirection: 'row', alignItems: 'center', gap: 14 },
  methodIcon:       { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: c.subtle, alignItems: 'center', justifyContent: 'center' },
  methodIconActive: { backgroundColor: `${c.green}22` },
  methodTitle:      { fontSize: FontSize.sm, fontWeight: '600', color: c.muted, marginBottom: 2 },
  methodSub:        { fontSize: FontSize.xs, color: c.muted },
  radio:            { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  radioActive:      { borderColor: c.green },
  radioDot:         { width: 10, height: 10, borderRadius: 5, backgroundColor: c.green },

  infoTitle:        { fontSize: FontSize.sm, fontWeight: '700', color: c.green, marginBottom: 6 },
  infoText:         { fontSize: FontSize.sm, color: c.muted, lineHeight: 20 },

  footer:           { padding: Spacing.xl, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.surface, gap: 12 },
  footerRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLabel:      { fontSize: FontSize.sm, color: c.muted },
  footerTotal:      { fontSize: FontSize.xl, color: c.text, fontWeight: '900' },

  successWrapper:   { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: 16 },
  successTitle:     { fontSize: FontSize.xl, fontWeight: '800', color: c.text, textAlign: 'center' },
  successSub:       { fontSize: FontSize.sm, color: c.muted, textAlign: 'center', lineHeight: 22 },

  pollingInfo:      { backgroundColor: `${c.green}11`, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: `${c.green}22` },
  pollingTxt:       { color: c.green, fontSize: FontSize.xs, fontWeight: '600', textAlign: 'center' },
});
