import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Input } from '../../components/ui/Input';
import { PRODUTOS, Produto } from '../../data/mock';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

interface Props { navigation: any; addToCart: (p: Produto) => void; }

export function SearchScreen({ navigation, addToCart }: Props) {
  const [q, setQ] = useState('');
  const results = PRODUTOS.filter(p => q && p.nome.toLowerCase().includes(q.toLowerCase()));

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={{ color: Colors.text, fontSize: 18 }}>←</Text>
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

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.bg },
  header:     { padding: Spacing.xl, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, flexDirection: 'row', gap: 12, alignItems: 'center' },
  backBtn:    { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptySub:   { color: Colors.muted, textAlign: 'center' },
  list:       { padding: Spacing.xl, gap: 10 },
  count:      { color: Colors.muted, fontSize: FontSize.sm, marginBottom: 12 },
  result:     { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', gap: 14, alignItems: 'center' },
  resultIcon: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 10 },
  name:       { color: Colors.text, fontWeight: '700', fontSize: FontSize.base },
  sup:        { color: Colors.muted, fontSize: FontSize.sm },
  price:      { color: Colors.green, fontWeight: '800', fontSize: FontSize.base },
  addBtn:     { backgroundColor: Colors.green, borderRadius: 10, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
