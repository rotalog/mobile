import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { PEDIDOS } from '../../data/mock';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

const STATUS_COLOR: Record<string, string> = { entregue: Colors.green, cancelado: Colors.danger, pendente: Colors.warning };
const STATUS_ICON:  Record<string, string> = { entregue: '✓', cancelado: '✕', pendente: '⏱' };

export function HistoryScreen({ navigation }: { navigation: any }) {
  return (
    <View style={s.container}>
      <TopBar title="Histórico de Pedidos" onBack={() => navigation.goBack()} />
      <FlatList
        data={PEDIDOS}
        keyExtractor={i => i.id}
        contentContainerStyle={s.list}
        renderItem={({ item: p }) => (
          <View style={s.card}>
            <View style={s.top}>
              <Text style={s.id}>{p.id}</Text>
              <View style={[s.badge, { backgroundColor: `${STATUS_COLOR[p.status]}22` }]}>
                <Text style={[s.badgeTxt, { color: STATUS_COLOR[p.status] }]}>
                  {STATUS_ICON[p.status]} {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </Text>
              </View>
            </View>
            <Text style={s.meta}>{p.fornecedor} · {p.data}</Text>
            <Text style={s.itens}>{p.itens.join(' · ')}</Text>
            <View style={s.footer}>
              <Text style={s.total}>{p.total}</Text>
              {p.status === 'entregue' && (
                <TouchableOpacity style={s.repeatBtn}>
                  <Text style={s.repeatTxt}>Repetir pedido</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  list:      { padding: Spacing.xl, gap: 12 },
  card:      { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  top:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  id:        { fontWeight: '800', color: Colors.text, fontSize: FontSize.base },
  badge:     { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  badgeTxt:  { fontSize: FontSize.xs, fontWeight: '700' },
  meta:      { color: Colors.muted, fontSize: FontSize.sm },
  itens:     { color: Colors.muted, fontSize: FontSize.xs, marginBottom: 12 },
  footer:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total:     { color: Colors.green, fontWeight: '800', fontSize: FontSize.base },
  repeatBtn: { backgroundColor: `${Colors.green}22`, borderWidth: 1, borderColor: `${Colors.green}44`, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  repeatTxt: { color: Colors.green, fontWeight: '700', fontSize: FontSize.xs },
});
