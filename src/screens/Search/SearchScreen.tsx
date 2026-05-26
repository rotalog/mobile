import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Input } from '../../components/ui/Input';
import { Produto } from '../../data/mock';
import { ColorPalette, FontSize, Radius, Spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props { navigation: any; addToCart: (p: Produto) => void; }

export function SearchScreen({ navigation, addToCart }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = React.useMemo(() => createStyles(colors), [colors]);
  const [q, setQ]           = useState('');
  const [results, setResults] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (text: string) => {
    setQ(text);
    if (!text.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      // Busca todos os fornecedores e filtra produtos pelo nome
      const { data: suppliers } = await api.get('/api/v1/suppliers');
      const supplierList = Array.isArray(suppliers) ? suppliers : suppliers.content ?? suppliers.suppliers ?? [];
      const found: Produto[] = [];
      await Promise.all(
        supplierList.slice(0, 10).map(async (s: any) => {
          try {
            const { data } = await api.get(`/api/v1/suppliers/${s.id}/products`);
            const prods = Array.isArray(data) ? data : data.content ?? data.products ?? [];
            prods.forEach((p: any) => {
              const nome = p.name ?? p.nome ?? '';
              if (nome.toLowerCase().includes(text.toLowerCase())) {
                found.push({
                  id: p.id,
                  nome,
                  preco: p.price ?? p.preco ?? 0,
                  unidade: p.unit ?? p.unidade ?? 'un',
                  fornecedor: s.name ?? s.nome ?? '',
                  img: p.img ?? '📦',
                  categoria: p.category ?? p.categoria ?? '',
                  estoque: (p.stockQuantity ?? p.quantity ?? 1) > 0,
                });
              }
            });
          } catch { /* ignora */ }
        })
      );
      setResults(found);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <View style={[s.header, { paddingTop: insets.top + Spacing.xl }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={{ color: colors.text, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Input
            placeholder="Buscar produtos, fornecedores..."
            value={q}
            onChangeText={setQ}
            containerStyle={{ marginBottom: 0 }}
            autoFocus
          />
        </View>
      </View>

      {!q ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>⌕</Text>
          <Text style={s.emptySub}>Digite para buscar produtos ou fornecedores</Text>
        </View>
      ) : loading ? (
        <View style={s.empty}><ActivityIndicator color={colors.green} size="large" /></View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={i => String(i.id)}
          contentContainerStyle={s.list}
          ListHeaderComponent={
            <Text style={s.count}>{results.length} resultado{results.length !== 1 ? 's' : ''} para "{q}"</Text>
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
              <Text style={s.emptySub}>Nenhum resultado encontrado</Text>
            </View>
          }
          renderItem={({ item: p }) => (
            <TouchableOpacity style={s.result} onPress={() => navigation.navigate('Product', { produto: p })}>
              <View style={s.resultIcon}><Text style={{ fontSize: 32 }}>{p.img}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{p.nome}</Text>
                <Text style={s.sup}>{p.fornecedor} · {p.categoria}</Text>
                <Text style={s.price}>R$ {p.preco.toFixed(2)}/{p.unidade}</Text>
              </View>
              <TouchableOpacity onPress={() => addToCart(p)} style={s.addBtn}>
                <Text style={{ color: '#0A0C0E', fontWeight: '800', fontSize: FontSize.sm }}>+</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container:  { flex: 1, backgroundColor: colors.bg },
  header:     { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', gap: 12, alignItems: 'center' },
  backBtn:    { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: Radius.md, width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptySub:   { color: colors.muted, textAlign: 'center' },
  list:       { padding: Spacing.xl, gap: 10 },
  count:      { color: colors.muted, fontSize: FontSize.sm, marginBottom: 12 },
  result:     { backgroundColor: colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', gap: 14, alignItems: 'center' },
  resultIcon: { backgroundColor: colors.surface, borderRadius: Radius.md, padding: 10 },
  name:       { color: colors.text, fontWeight: '700', fontSize: FontSize.base },
  sup:        { color: colors.muted, fontSize: FontSize.sm },
  price:      { color: colors.green, fontWeight: '800', fontSize: FontSize.base },
  addBtn:     { backgroundColor: colors.green, borderRadius: 10, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
