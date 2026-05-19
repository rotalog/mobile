import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Button } from '../../components/ui/Button';
import { FORNECEDORES, PRODUTOS, Fornecedor, Produto } from '../../data/mock';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

interface Props { navigation: any; route: any; addToCart: (p: Produto) => void; }

export function SupplierScreen({ navigation, route, addToCart }: Props) {
  const f: Fornecedor = route?.params?.fornecedor ?? FORNECEDORES[0];
  const produtos = PRODUTOS.slice(0, 4);

  return (
    <View style={s.container}>
      <TopBar title="" onBack={() => navigation.goBack()} transparent />
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Hero */}
        <View style={[s.hero, { backgroundColor: `${f.cor}11` }]}>
          <Text style={{ fontSize: 64, marginBottom: 12 }}>{f.img}</Text>
          <Text style={s.name}>{f.nome}</Text>
          <Text style={s.cat}>{f.categoria}</Text>
          <View style={s.stats}>
            {([['Avaliação', f.nota], ['Entregas', f.entregas], ['Distância', f.distancia]] as [string, any][]).map(([k, v]) => (
              <View key={k} style={{ alignItems: 'center' }}>
                <Text style={s.statVal}>{v}</Text>
                <Text style={s.statKey}>{k}</Text>
              </View>
            ))}
          </View>
          <View style={s.etaBadge}>
            <Text style={s.etaTxt}>🕐 Entrega estimada: <Text style={{ color: Colors.text, fontWeight: '700' }}>{f.tempo}</Text></Text>
          </View>
        </View>

        {/* Produtos */}
        <Text style={s.section}>— PRODUTOS DISPONÍVEIS</Text>
        <View style={s.grid}>
          {produtos.map(p => (
            <View key={p.id} style={s.prodCard}>
              <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: 8 }}>{p.img}</Text>
              <Text style={s.prodName} numberOfLines={2}>{p.nome}</Text>
              <Text style={s.prodPrice}>R$ {p.preco.toFixed(2)}/{p.unidade}</Text>
              <Button label="+ Adicionar" onPress={() => addToCart(p)} sm full style={{ marginTop: 8 }} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll:    { padding: Spacing.xl, gap: 16 },
  hero:      { alignItems: 'center', borderRadius: Radius.xl, padding: Spacing.xl },
  name:      { color: Colors.text, fontSize: FontSize.xl, fontWeight: '900', marginBottom: 4 },
  cat:       { color: Colors.muted, marginBottom: 12 },
  stats:     { flexDirection: 'row', gap: 32, marginBottom: 12 },
  statVal:   { color: Colors.green, fontWeight: '900', fontSize: FontSize.lg, textAlign: 'center' },
  statKey:   { color: Colors.muted, fontSize: FontSize.xs },
  etaBadge:  { backgroundColor: Colors.card, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border },
  etaTxt:    { color: Colors.muted, fontSize: FontSize.sm },
  section:   { color: Colors.muted, fontSize: FontSize.xs, letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase' },
  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  prodCard:  { flex: 1, minWidth: '45%', backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  prodName:  { color: Colors.text, fontWeight: '700', fontSize: FontSize.sm, marginBottom: 4 },
  prodPrice: { color: Colors.green, fontWeight: '800', fontSize: FontSize.sm },
});
