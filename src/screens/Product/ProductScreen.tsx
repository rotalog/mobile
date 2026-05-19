import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Badge } from '../../components/ui/index';
import { FORNECEDORES, PRODUTOS, Produto } from '../../data/mock';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

interface Props { navigation: any; route: any; addToCart: (p: Produto) => void; }

export function ProductScreen({ navigation, route, addToCart }: Props) {
  const p: Produto = route?.params?.produto ?? PRODUTOS[0];
  const fornecedores = FORNECEDORES.slice(0, 3).map(f => ({
    ...f,
    preco: (p.preco * (0.9 + Math.random() * 0.3)).toFixed(2),
  }));

  return (
    <View style={s.container}>
      <TopBar title="" onBack={() => navigation.goBack()} transparent />
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.hero}>
          <Text style={{ fontSize: 80, marginBottom: 12 }}>{p.img}</Text>
          <Text style={s.name}>{p.nome}</Text>
          <Text style={s.cat}>{p.categoria}</Text>
          <View style={s.badges}>
            <Badge label="★ 4.7" color={Colors.warning} />
            <Badge
              label={p.estoque ? 'Em estoque' : 'Indisponível'}
              color={p.estoque ? Colors.green : Colors.danger}
            />
          </View>
        </View>

        <Text style={s.section}>— FORNECEDORES DISPONÍVEIS</Text>
        {fornecedores.map(f => (
          <TouchableOpacity
            key={f.id}
            style={s.row}
            onPress={() => addToCart({ ...p, fornecedor: f.nome, preco: parseFloat(f.preco) })}
            activeOpacity={0.8}
          >
            <View style={[s.fIcon, { backgroundColor: `${f.cor}22` }]}>
              <Text style={{ fontSize: 28 }}>{f.img}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.fName}>{f.nome}</Text>
              <Text style={s.fMeta}>⏱ {f.tempo} · 📍 {f.distancia}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.fPrice}>R$ {f.preco}</Text>
              <Text style={s.fUnit}>/{p.unidade}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll:    { padding: Spacing.xl, gap: 12 },
  hero:      { alignItems: 'center', paddingVertical: Spacing.xl },
  name:      { color: Colors.text, fontSize: FontSize.xl, fontWeight: '900', marginBottom: 4 },
  cat:       { color: Colors.muted, marginBottom: 8 },
  badges:    { flexDirection: 'row', gap: 8 },
  section:   { color: Colors.muted, fontSize: FontSize.xs, letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase' },
  row:       { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  fIcon:     { width: 52, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  fName:     { color: Colors.text, fontWeight: '700', fontSize: FontSize.base },
  fMeta:     { color: Colors.muted, fontSize: FontSize.sm },
  fPrice:    { color: Colors.green, fontWeight: '900', fontSize: FontSize.lg },
  fUnit:     { color: Colors.muted, fontSize: FontSize.xs },
});
