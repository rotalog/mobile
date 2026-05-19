import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Button } from '../../components/ui/Button';
import { CartItem } from '../../hooks/useCart';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

interface Props {
  navigation: any;
  cart: CartItem[];
  updateQty: (id: number, fornecedor: string, delta: number) => void;
  total: number;
}

export function CartScreen({ navigation, cart, updateQty, total }: Props) {
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
                    <Text style={[s.qtyBtnTxt, { color: '#0A0C0E' }]}>+</Text>
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
            <Button label="FINALIZAR PEDIDO" 
            onPress={() => navigation.navigate('Payment', { total, orderId: `#${Date.now()}` })}/>
          </View>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.bg },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle:  { color: Colors.text, fontSize: FontSize.lg, fontWeight: '800', marginBottom: 8 },
  emptySub:    { color: Colors.muted, textAlign: 'center' },
  list:        { padding: Spacing.xl, gap: 12 },
  item:        { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', gap: 12, alignItems: 'center' },
  itemIcon:    { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 8 },
  itemInfo:    { flex: 1 },
  itemName:    { color: Colors.text, fontWeight: '700', fontSize: FontSize.base },
  itemSup:     { color: Colors.muted, fontSize: FontSize.sm },
  itemPrice:   { color: Colors.green, fontWeight: '800', fontSize: FontSize.base },
  qtyRow:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn:      { backgroundColor: Colors.subtle, borderRadius: 8, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyBtnGreen: { backgroundColor: Colors.green },
  qtyBtnTxt:   { color: Colors.text, fontSize: 16, fontWeight: '800' },
  qtyNum:      { color: Colors.text, fontWeight: '800', minWidth: 20, textAlign: 'center' },
  footer:      { padding: Spacing.xl, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
  totalRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  totalLabel:  { color: Colors.muted, fontSize: FontSize.base },
  totalValue:  { color: Colors.green, fontSize: FontSize.xl, fontWeight: '900' },
});
