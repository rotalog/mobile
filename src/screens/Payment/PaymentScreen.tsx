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
  const total   = route?.params?.total   ?? 0;
  const orderId = route?.params?.orderId ?? '#0000';

  const { clearCart } = useCart();
  const [method, setMethod]   = useState<PaymentMethod>('pix');
  const [status, setStatus]   = useState<PaymentStatus>('idle');
  const [codigo, setCodigo]   = useState('');
  const pollingRef            = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingIdRef          = useRef<string>(orderId);
  const isSubmittingRef       = useRef(false);

  const totalFmt = `R$ ${total.toFixed(2).replace('.', ',')}`;

  const applyPaymentStatus = (paymentStatus?: string | null) => {
    if (paymentStatus === 'CONFIRMED' || paymentStatus === 'APPROVED') {
      clearCart();
      setStatus('confirmed');
      pararPolling();
      return true;
    }

    if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
      setStatus('failed');
      pararPolling();
      return true;
    }

    return false;
  };

  // Polling — verifica status do pagamento a cada 5s
  const iniciarPolling = (id: string) => {
    pollingIdRef.current = id;
    pollingRef.current = setInterval(async () => {
      try {
        const { data } = await api.get(`/api/v1/payments/${id}`);
        applyPaymentStatus(data.status);
      } catch {}
    }, 5000);
  };

  const verificarPagamento = async () => {
    try {
      const { data } = await api.get(`/api/v1/payments/${pollingIdRef.current}`);
      applyPaymentStatus(data.status);
    } catch {}
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
    if (isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setStatus('loading');
    try {
      const { data } = await api.post('/api/v1/payments/create', {
        orderId,
        method,
        amount: total,
      });

      setCodigo(data.code ?? data.pixCode ?? data.boletoCode ?? '');

      if (applyPaymentStatus(data.status)) {
        return;
      }

      setStatus('pending');
      iniciarPolling(String(data.orderId ?? orderId));
    } catch {
      setCodigo('');
      setStatus('failed');
    } finally {
      isSubmittingRef.current = false;
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
            onPress={verificarPagamento}
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
            <Text style={[s.detailValue, { color: Colors.green, fontSize: FontSize.lg }]}>{totalFmt}</Text>
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
                <Text style={[s.methodTitle, method === m.key && { color: Colors.text }]}>{m.label}</Text>
                <Text style={s.methodSub}>{m.sub}</Text>
              </View>
            </View>
            <View style={[s.radio, method === m.key && s.radioActive]}>
              {method === m.key && <View style={s.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        <View style={[s.card, { borderColor: `${Colors.green}44` }]}>
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
const s = StyleSheet.create({
  container:        { flex: 1, backgroundColor: Colors.bg },
  list:             { padding: Spacing.xl, gap: 12 },
  sectionLabel:     { fontSize: FontSize.xs, fontWeight: '700', color: Colors.green, letterSpacing: 1.2, marginBottom: 4, marginTop: 4 },

  card:             { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  detailRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  detailLabel:      { fontSize: FontSize.sm, color: Colors.muted },
  detailValue:      { fontSize: FontSize.sm, color: Colors.text, fontWeight: '600' },

  codeBox:          { backgroundColor: Colors.subtle, borderRadius: Radius.md, padding: Spacing.md },
  codeLabel:        { fontSize: FontSize.xs, color: Colors.muted, marginBottom: 6, fontWeight: '700', letterSpacing: 0.8 },
  codeValue:        { fontSize: FontSize.xs, color: Colors.green, lineHeight: 18 },

  methodCard:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  methodCardActive: { borderColor: Colors.green },
  methodLeft:       { flexDirection: 'row', alignItems: 'center', gap: 14 },
  methodIcon:       { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Colors.subtle, alignItems: 'center', justifyContent: 'center' },
  methodIconActive: { backgroundColor: `${Colors.green}22` },
  methodTitle:      { fontSize: FontSize.sm, fontWeight: '600', color: Colors.muted, marginBottom: 2 },
  methodSub:        { fontSize: FontSize.xs, color: Colors.muted },
  radio:            { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioActive:      { borderColor: Colors.green },
  radioDot:         { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.green },

  infoTitle:        { fontSize: FontSize.sm, fontWeight: '700', color: Colors.green, marginBottom: 6 },
  infoText:         { fontSize: FontSize.sm, color: Colors.muted, lineHeight: 20 },

  footer:           { padding: Spacing.xl, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface, gap: 12 },
  footerRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLabel:      { fontSize: FontSize.sm, color: Colors.muted },
  footerTotal:      { fontSize: FontSize.xl, color: Colors.text, fontWeight: '900' },

  successWrapper:   { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: 16 },
  successTitle:     { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  successSub:       { fontSize: FontSize.sm, color: Colors.muted, textAlign: 'center', lineHeight: 22 },

  pollingInfo:      { backgroundColor: `${Colors.green}11`, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: `${Colors.green}22` },
  pollingTxt:       { color: Colors.green, fontSize: FontSize.xs, fontWeight: '600', textAlign: 'center' },
});