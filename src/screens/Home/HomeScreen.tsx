import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/AppNavigator';
import { Badge, Avatar, Rating } from '../../components/ui/index';
import { CATEGORIAS } from '../../data/mock';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { api } from '../../services/api';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

// ── Fallbacks ─────────────────────────────────────────────────────────────────
const NOTAS      = [4.5, 4.7, 4.8, 4.3, 4.9, 4.6];
const CATEGORIAS_FB = ['Carnes & Frios', 'Construção Civil', 'Frutas & Verduras', 'Cereais & Grãos', 'Carnes & Aves', 'Metalurgia'];
const ENTREGAS_FB   = [342, 187, 521, 289, 156, 94];

// Normaliza um fornecedor da API adicionando fallbacks
function normalizarFornecedor(f: any) {
  const id = typeof f.id === 'number' ? f.id : parseInt(f.id) || 0;
  return {
    ...f,
    nome:      f.name      ?? f.nome      ?? '',
    categoria: f.category  ?? f.categoria ?? CATEGORIAS_FB[id % CATEGORIAS_FB.length],
    nota:      f.rating    ?? f.nota      ?? NOTAS[id % NOTAS.length],
    entregas:  f.deliveries ?? f.entregas ?? ENTREGAS_FB[id % ENTREGAS_FB.length],
    tempo:     f.deliveryTime ?? f.tempo  ?? '-',
    distancia: f.distance  ?? f.distancia ?? '-',
    img:       f.img       ?? '🏪',
    cor:       f.cor       ?? Colors.green,
    badge:     f.badge     ?? null,
  };
}

export function HomeScreen({ navigation }: Props) {
  const [catAtiva, setCatAtiva] = useState('Todos');
  const [busca, setBusca] = useState('');
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    async function loadSuppliers() {
      try {
        setErro(false);
        const { data } = await api.get('/api/v1/suppliers');
        const lista = Array.isArray(data) ? data : data.content ?? data.suppliers ?? [];
        // Normaliza todos antes de salvar no estado
        setFornecedores(lista.map(normalizarFornecedor));
      } catch {
        setErro(true);
      } finally {
        setLoading(false);
      }
    }
    loadSuppliers();
  }, []);

  // Agora o filtro usa os campos já normalizados
  const fornFiltrados = fornecedores.filter(f =>
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
            <Text style={s.greeting}>Bom dia! 👋</Text>
          </View>
          <Avatar letter="R" size={40} />
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
      {loading ? (
        <View style={s.center}><ActivityIndicator color={Colors.green} size="large" /></View>
      ) : erro ? (
        <View style={s.center}>
          <Text style={{ color: Colors.muted, textAlign: 'center' }}>Não foi possível carregar os fornecedores.</Text>
        </View>
      ) : (
        <FlatList
          data={fornFiltrados}
          keyExtractor={i => String(i.id)}
          contentContainerStyle={s.list}
          ListHeaderComponent={
            <View style={s.listHeader}>
              <Text style={s.listTitle}>Fornecedores</Text>
              <Text style={s.listAll}>{fornFiltrados.length} disponíveis</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={{ color: Colors.muted }}>Nenhum fornecedor encontrado.</Text>
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
                    {f.tempo !== '-' && <Text style={s.metaText}>⏱ {f.tempo}</Text>}
                    {f.distancia !== '-' && <Text style={s.metaText}>📍 {f.distancia}</Text>}
                    <Text style={s.metaText}>📦 {f.entregas} entregas</Text>
                  </View>
                </View>
              </View>
              {f.badge && <View style={{ marginTop: 10 }}><Badge label={f.badge} /></View>}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container:        { flex: 1, backgroundColor: Colors.bg },
  header:           { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, padding: Spacing.xl, paddingBottom: 0 },
  headerTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  location:         { color: Colors.muted, fontSize: FontSize.sm },
  greeting:         { color: Colors.text, fontSize: FontSize.lg, fontWeight: '800', marginTop: 4 },
  searchBar:        { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.lg, padding: Spacing.md, gap: 10, marginBottom: Spacing.md },
  searchIcon:       { fontSize: 16, color: Colors.muted },
  searchPlaceholder:{ color: Colors.muted, fontSize: FontSize.base, flex: 1 },
  cats:             { marginBottom: Spacing.md },
  catChip:          { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 7 },
  catChipActive:    { backgroundColor: Colors.green, borderColor: Colors.green },
  catText:          { color: Colors.muted, fontSize: FontSize.sm, fontWeight: '700' },
  catTextActive:    { color: '#0A0C0E' },
  list:             { padding: Spacing.xl, gap: 12 },
  listHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  listTitle:        { color: Colors.text, fontWeight: '800', fontSize: FontSize.base },
  listAll:          { color: Colors.green, fontSize: FontSize.sm, fontWeight: '700' },
  card:             { backgroundColor: Colors.card, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  cardRow:          { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  cardIcon:         { width: 56, height: 56, borderRadius: Radius.lg, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  cardInfo:         { flex: 1 },
  cardTop:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName:         { fontWeight: '800', fontSize: FontSize.base, color: Colors.text, flex: 1 },
  cardCat:          { color: Colors.muted, fontSize: FontSize.sm },
  cardMeta:         { flexDirection: 'row', gap: Spacing.lg, marginTop: 8, flexWrap: 'wrap' },
  metaText:         { color: Colors.muted, fontSize: FontSize.xs },
  center:           { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
});
