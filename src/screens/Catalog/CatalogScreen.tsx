import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useTheme } from '../../context/ThemeContext';
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PRODUTOS, Produto } from '../../data/mock';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

const CATS = ['Todos', 'Carnes', 'Construção', 'Verduras', 'Grãos', 'Aves', 'Legumes'];

interface Props { navigation: any; addToCart: (p: Produto) => void; }

export function CatalogScreen({ navigation, addToCart }: Props) {
  const s = useThemedStyles(buildStyles);
  const { colors } = useTheme();

  const [busca, setBusca] = useState('');
  const [cat, setCat] = useState('Todos');
  const filtrados = PRODUTOS.filter(p =>
    (cat === 'Todos' || p.categoria === cat) &&
    p.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <View style={s.container}>
      <TopBar title="Catálogo de Produtos" onBack={() => navigation.goBack()} />
      <View style={s.filters}>
        <Input placeholder="Buscar produto..." value={busca} onChangeText={setBusca} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: Spacing.md }}>
          {CATS.map(c => (
            <TouchableOpacity key={c} onPress={() => setCat(c)} style={[s.chip, cat === c && s.chipActive]}>
              <Text style={[s.chipText, cat === c && s.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={filtrados}
        keyExtractor={i => String(i.id)}
        numColumns={2}
        contentContainerStyle={s.grid}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item: p }) => (
          <TouchableOpacity style={s.card} onPress={() => navigation.navigate('Product', { produto: p })} activeOpacity={0.8}>
            <View style={s.cardImg}><Text style={{ fontSize: 40 }}>{p.img}</Text></View>
            <Text style={s.cardName} numberOfLines={2}>{p.nome}</Text>
            <Text style={s.cardSup}>{p.fornecedor}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2, marginBottom: 8 }}>
              <Text style={s.cardPrice}>R$ {p.preco.toFixed(2)}</Text>
              <Text style={s.cardUnit}>/{p.unidade}</Text>
            </View>
            {p.estoque
              ? <Button label="+ Adicionar" onPress={() => addToCart(p)} sm full />
              : <Button label="Indisponível" onPress={() => {}} sm full disabled />
            }
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const buildStyles = (c: import('../../theme').ColorPalette) => ({
  container:     { flex: 1, backgroundColor: c.bg },
  filters:       { padding: Spacing.xl, paddingBottom: 0 },
  chip:          { backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  chipActive:    { backgroundColor: c.green, borderColor: c.green },
  chipText:      { color: c.muted, fontSize: FontSize.xs, fontWeight: '700' },
  chipTextActive:{ color: '#0A0C0E' },
  grid:          { padding: Spacing.xl, gap: 12 },
  card:          { flex: 1, backgroundColor: c.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: c.border },
  cardImg:       { alignItems: 'center', backgroundColor: c.surface, borderRadius: Radius.md, paddingVertical: 12, marginBottom: 8 },
  cardName:      { color: c.text, fontWeight: '700', fontSize: FontSize.sm, marginBottom: 2 },
  cardSup:       { color: c.muted, fontSize: FontSize.xs, marginBottom: 6 },
  cardPrice:     { color: c.green, fontWeight: '800', fontSize: FontSize.base },
  cardUnit:      { color: c.muted, fontSize: FontSize.xs },
});
