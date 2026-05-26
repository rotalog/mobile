import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Button } from '../../components/ui/Button';
import { ColorPalette, FontSize, Radius, Spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useDelivery } from '../../context/DeliveryContext';

// ── Types ─────────────────────────────────────────────────────────────────────
type PaymentMethod = 'pix' | 'boleto';
type PaymentStatus = 'idle' | 'loading' | 'success';

const METHODS: { key: PaymentMethod; icon: string; label: string; sub: string }[] = [
  { key: 'pix', icon: '⚡', label: 'Pix', sub: 'Aprovação imediata' },
  { key: 'boleto', icon: '🧾', label: 'Boleto bancário', sub: 'Vence em 3 dias úteis' },
];

// ── Component ─────────────────────────────────────────────────────────────────
export function PaymentScreen({ navigation, route }: { navigation: any; route?: any }) {
  const { colors } = useTheme();
  const s = React.useMemo(() => createStyles(colors), [colors]);
  const total = route?.params?.total ?? 0;
  const orderId = route?.params?.orderId ?? `${Date.now()}`;

  const { clearCart } = useCart();
  const [method, setMethod]   = useState<PaymentMethod>('pix');
  const [status, setStatus]   = useState<PaymentStatus>('idle');
  const [codigo, setCodigo]   = useState('');
  const pollingRef            = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingIdRef          = useRef<string>(orderId);
  const isSubmittingRef       = useRef(false);

  const totalFmt = `R$ ${total.toFixed(2).replace('.', ',')}`;
  const { cart, clearCart } = useCart();
  const { addOrder } = useDelivery();

  const handleConfirm = () => {
    setStatus('loading');

    const cleanOrderId = orderId.toString().replace('#', '') || `${Date.now()}`;
    const amountInCents = Math.round(total * 100).toString().padStart(10, '0');
    const code = method === 'pix'
      ? `00020126580014BR.GOV.BCB.PIX0136ROTALOG-${cleanOrderId}520400005303986540${total.toFixed(2)}5802BR5925ROTALOG6006MANAUS62070503***6304ABCD`
      : `23790.00009 00000.000000 ${cleanOrderId.slice(-10).padStart(10, '0')} 1 000000${amountInCents}`;

    setPaymentData(method === 'pix' ? { pixCode: code } : { digitableLine: code });
    addOrder({
      id: cleanOrderId,
      items: cart,
      total,
    });
    clearCart();
    setStatus('success');
  };

  if (status === 'success') {
    const codigo = method === 'pix'
      ? (paymentData?.pixCode ?? paymentData?.qrCode ?? paymentData?.code ?? '—')
      : (paymentData?.barCode ?? paymentData?.digitableLine ?? paymentData?.code ?? '—');

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
              <Text style={s.detailValue}>#{orderId.toString().replace('#', '')}</Text>
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

  return (
    <View style={s.container}>
      <TopBar title="Pagamento" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={s.list}>
        <Text style={s.sectionLabel}>— RESUMO DO PEDIDO</Text>
        <View style={s.card}>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Pedido</Text>
            <Text style={s.detailValue}>#{orderId.toString().replace('#', '')}</Text>
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
                <Text style={[s.methodTitle, method === m.key && { color: colors.text }]}>
                  {m.label}
                </Text>
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

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container:        { flex: 1, backgroundColor: colors.bg },
  list:             { padding: Spacing.xl, gap: 12 },
  sectionLabel:     { fontSize: FontSize.xs, fontWeight: '700', color: colors.green, letterSpacing: 1.2, marginBottom: 4, marginTop: 4 },
  card:             { backgroundColor: colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: colors.border },
  detailRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel:      { fontSize: FontSize.sm, color: colors.muted },
  detailValue:      { fontSize: FontSize.sm, color: colors.text, fontWeight: '600' },
  codeBox:          { backgroundColor: colors.subtle, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.md },
  codeLabel:        { fontSize: FontSize.xs, color: colors.muted, marginBottom: 6, fontWeight: '700', letterSpacing: 0.8 },
  codeValue:        { fontSize: FontSize.xs, color: colors.green, lineHeight: 18 },
  methodCard:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  methodCardActive: { borderColor: colors.green },
  methodLeft:       { flexDirection: 'row', alignItems: 'center', gap: 14 },
  methodIcon:       { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: colors.subtle, alignItems: 'center', justifyContent: 'center' },
  methodIconActive: { backgroundColor: `${colors.green}22` },
  methodTitle:      { fontSize: FontSize.sm, fontWeight: '600', color: colors.muted, marginBottom: 2 },
  methodSub:        { fontSize: FontSize.xs, color: colors.muted },
  radio:            { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioActive:      { borderColor: colors.green },
  radioDot:         { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.green },
  infoTitle:        { fontSize: FontSize.sm, fontWeight: '700', color: colors.green, marginBottom: 6 },
  infoText:         { fontSize: FontSize.sm, color: colors.muted, lineHeight: 20 },
  footer:           { padding: Spacing.xl, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, gap: 12 },
  footerRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLabel:      { fontSize: FontSize.sm, color: colors.muted },
  footerTotal:      { fontSize: FontSize.xl, color: colors.text, fontWeight: '900' },
  successWrapper:   { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: 16 },
  successTitle:     { fontSize: FontSize.xl, fontWeight: '800', color: colors.text, textAlign: 'center' },
  successSub:       { fontSize: FontSize.sm, color: colors.muted, textAlign: 'center', lineHeight: 22 },
});
