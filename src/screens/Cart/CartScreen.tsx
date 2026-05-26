import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Button } from '../../components/ui/Button';
import { CartItem } from '../../hooks/useCart';
import { ColorPalette, FontSize, Radius, Spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  navigation: any;
  cart: CartItem[];
  updateQty: (id: number, fornecedor: string, delta: number) => void;
  total: number;
}

export function CartScreen({ navigation, cart, updateQty, total }: Props) {
  const { colors } = useTheme();
  const s = React.useMemo(() => createStyles(colors), [colors]);

  const handleFinalizarPedido = () => {
    if (cart.length === 0) return;
    navigation.navigate('Payment', { total, orderId: `${Date.now()}` });
  };

  return (
    <View style={s.container}>
      <TopBar title={`Carrinho (${cart.length})`} onBack={() => navigation.goBack()} />
      {cart.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🛒</Text>
          <Text style={s.emptyTitle}>Carrinho vazio</Text>
          <Text style={s.emptySub}>Adicione produtos do catálogo</Text>
          <Button label="IR AO CATÁLOGO" onPress={() => navigation.navigate('HomeTab')} style={{ marginTop: 24 }} />
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={i => `${i.id}-${i.fornecedor}`}
            contentContainerStyle={s.list}
            renderItem={({ item }) => (
              <View style={s.item}>
                <View style={s.itemIcon}><Text style={{ fontSize: 28 }}>{item.img}</Text></View>
                <View style={s.itemInfo}>
                  <Text style={s.itemName} numberOfLines={1}>{item.nome}</Text>
                  <Text style={s.itemSup}>{item.fornecedor}</Text>
                  <Text style={s.itemPrice}>R$ {(item.preco * item.qty).toFixed(2)}</Text>
                </View>
                <View style={s.qtyRow}>
                  <TouchableOpacity onPress={() => updateQty(item.id, item.fornecedor, -1)} style={s.qtyBtn}>
                    <Text style={s.qtyBtnTxt}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.qtyNum}>{item.qty}</Text>
                  <TouchableOpacity onPress={() => updateQty(item.id, item.fornecedor, +1)} style={[s.qtyBtn, s.qtyBtnGreen]}>
                    <Text style={[s.qtyBtnTxt, { color: colors.onPrimary }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          <View style={s.footer}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Total</Text>
              <Text style={s.totalValue}>R$ {total.toFixed(2)}</Text>
            </View>
            <Button
              label="FINALIZAR PEDIDO"
              onPress={handleFinalizarPedido}
            />
          </View>
        </>
      )}
    </View>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.bg },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle:  { color: colors.text, fontSize: FontSize.lg, fontWeight: '800', marginBottom: 8 },
  emptySub:    { color: colors.muted, textAlign: 'center' },
  list:        { padding: Spacing.xl, gap: 12 },
  item:        { backgroundColor: colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', gap: 12, alignItems: 'center' },
  itemIcon:    { backgroundColor: colors.surface, borderRadius: Radius.md, padding: 8 },
  itemInfo:    { flex: 1 },
  itemName:    { color: colors.text, fontWeight: '700', fontSize: FontSize.base },
  itemSup:     { color: colors.muted, fontSize: FontSize.sm },
  itemPrice:   { color: colors.green, fontWeight: '800', fontSize: FontSize.base },
  qtyRow:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn:      { backgroundColor: colors.subtle, borderRadius: 8, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyBtnGreen: { backgroundColor: colors.green },
  qtyBtnTxt:   { color: colors.text, fontSize: 16, fontWeight: '800' },
  qtyNum:      { color: colors.text, fontWeight: '800', minWidth: 20, textAlign: 'center' },
  footer:      { padding: Spacing.xl, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  totalRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  totalLabel:  { color: colors.muted, fontSize: FontSize.base },
  totalValue:  { color: colors.green, fontSize: FontSize.xl, fontWeight: '900' },
});
