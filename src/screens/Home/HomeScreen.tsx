import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/AppNavigator';
import { Badge, Avatar, Rating } from '../../components/ui/index';
import { FORNECEDORES, CATEGORIAS } from '../../data/mock';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { useAuth } from '../../context/AuthContext';


type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

export function HomeScreen({ navigation }: Props) {
  const [catAtiva, setCatAtiva] = useState('Todos');
  const [busca, setBusca] = useState('');
  const { user } = useAuth();


  const fornFiltrados = FORNECEDORES.filter(f =>
    (catAtiva === 'Todos' || f.categoria.includes(catAtiva)) &&
    f.nome.toLowerCase().includes(busca.toLowerCase())
  );


  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <View>
            <Text style={s.location}>📍 R. das Acácias, 45</Text>
            <Text style={s.greeting}>Olá, {user?.name ?? 'Usuário'}! 👋</Text>
          </View>
         <Avatar letter={(user?.name ?? 'U').charAt(0)} size={40} />
        </View>

        {/* Search bar */}
        <TouchableOpacity style={s.searchBar} onPress={() => navigation.navigate('Search' as any)}>
          <Text style={s.searchIcon}>⌕</Text>
          <Text style={s.searchPlaceholder}>Buscar fornecedores e produtos...</Text>
        </TouchableOpacity>

        {/* Categorias */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.cats} contentContainerStyle={{ gap: 8 }}>
          {CATEGORIAS.map(c => (
            <TouchableOpacity key={c} onPress={() => setCatAtiva(c)}
              style={[s.catChip, catAtiva === c && s.catChipActive]}>
              <Text style={[s.catText, catAtiva === c && s.catTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Fornecedores */}
      <FlatList
        data={fornFiltrados}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={s.list}
        ListHeaderComponent={
          <View style={s.listHeader}>
            <Text style={s.listTitle}>Fornecedores próximos</Text>
            <Text style={s.listAll}>VER TODOS</Text>
          </View>
        }
        renderItem={({ item: f }) => (
          <TouchableOpacity style={s.card} onPress={() => navigation.navigate('Supplier', { fornecedor: f })} activeOpacity={0.8}>
            <View style={s.cardRow}>
              <View style={[s.cardIcon, { backgroundColor: `${f.cor}22`, borderColor: `${f.cor}44` }]}>
                <Text style={{ fontSize: 28 }}>{f.img}</Text>
              </View>
              <View style={s.cardInfo}>
                <View style={s.cardTop}>
                  <Text style={s.cardName} numberOfLines={1}>{f.nome}</Text>
                  <Rating value={f.nota} />
                </View>
                <Text style={s.cardCat}>{f.categoria}</Text>
                <View style={s.cardMeta}>
                  <Text style={s.metaText}>⏱ {f.tempo}</Text>
                  <Text style={s.metaText}>📍 {f.distancia}</Text>
                  <Text style={s.metaPrice}>{f.preco_medio}</Text>
                </View>
              </View>
            </View>
            {f.badge && <View style={{ marginTop: 10 }}><Badge label={f.badge} /></View>}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.bg },
  header:          { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, padding: Spacing.xl, paddingBottom: 0 },
  headerTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  location:        { color: Colors.muted, fontSize: FontSize.sm },
  greeting:        { color: Colors.text, fontSize: FontSize.lg, fontWeight: '800', marginTop: 4 },
  searchBar:       { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.lg, padding: Spacing.md, gap: 10, marginBottom: Spacing.md },
  searchIcon:      { fontSize: 16, color: Colors.muted },
  searchPlaceholder:{ color: Colors.muted, fontSize: FontSize.base, flex: 1 },
  cats:            { marginBottom: Spacing.md },
  catChip:         { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 7 },
  catChipActive:   { backgroundColor: Colors.green, borderColor: Colors.green },
  catText:         { color: Colors.muted, fontSize: FontSize.sm, fontWeight: '700' },
  catTextActive:   { color: '#0A0C0E' },
  list:            { padding: Spacing.xl, gap: 12 },
  listHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  listTitle:       { color: Colors.text, fontWeight: '800', fontSize: FontSize.base },
  listAll:         { color: Colors.green, fontSize: FontSize.sm, fontWeight: '700' },
  card:            { backgroundColor: Colors.card, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  cardRow:         { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  cardIcon:        { width: 56, height: 56, borderRadius: Radius.lg, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  cardInfo:        { flex: 1 },
  cardTop:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName:        { fontWeight: '800', fontSize: FontSize.base, color: Colors.text, flex: 1 },
  cardCat:         { color: Colors.muted, fontSize: FontSize.sm },
  cardMeta:        { flexDirection: 'row', gap: Spacing.lg, marginTop: 8, flexWrap: 'wrap' },
  metaText:        { color: Colors.muted, fontSize: FontSize.xs },
  metaPrice:       { color: Colors.green, fontSize: FontSize.xs, fontWeight: '700' },
});
