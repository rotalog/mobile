import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/AppNavigator';
import { Badge, Avatar, Rating } from '../../components/ui/index';
import { CATEGORIAS } from '../../data/mock';
import { ColorPalette, FontSize, Radius, Spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

export function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = React.useMemo(() => createStyles(colors), [colors]);
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
        setFornecedores(Array.isArray(data) ? data : data.content ?? data.suppliers ?? []);
      } catch {
        setErro(true);
      } finally {
        setLoading(false);
      }
    }
    loadSuppliers();
  }, []);

  const fornFiltrados = fornecedores.filter(f =>
    (catAtiva === 'Todos' || (f.category ?? f.categoria ?? '').includes(catAtiva)) &&
    (f.name ?? f.nome ?? '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + Spacing.xl }]}>
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
        <View style={s.center}><ActivityIndicator color={colors.green} size="large" /></View>
      ) : erro ? (
        <View style={s.center}>
          <Text style={{ color: colors.muted, textAlign: 'center' }}>Não foi possível carregar os fornecedores.</Text>
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
              <Text style={{ color: colors.muted }}>Nenhum fornecedor encontrado.</Text>
            </View>
          }
          renderItem={({ item: f }) => {
            const nome = f.name ?? f.nome ?? '';
            const categoria = f.category ?? f.categoria ?? '';
            const nota = f.rating ?? f.nota ?? 0;
            const tempo = f.deliveryTime ?? f.tempo ?? '-';
            const distancia = f.distance ?? f.distancia ?? '-';
            const img = f.img ?? '🏪';
            const cor = f.cor ?? colors.green;
            const badge = f.badge ?? null;

            return (
              <TouchableOpacity style={s.card} onPress={() => navigation.navigate('Supplier', { fornecedor: f })} activeOpacity={0.8}>
                <View style={s.cardRow}>
                  <View style={[s.cardIcon, { backgroundColor: `${cor}22`, borderColor: `${cor}44` }]}>
                    <Text style={{ fontSize: 28 }}>{img}</Text>
                  </View>
                  <View style={s.cardInfo}>
                    <View style={s.cardTop}>
                      <Text style={s.cardName} numberOfLines={1}>{nome}</Text>
                      <Rating value={nota} />
                    </View>
                    <Text style={s.cardCat}>{categoria}</Text>
                    <View style={s.cardMeta}>
                      {tempo !== '-' && <Text style={s.metaText}>⏱ {tempo}</Text>}
                      {distancia !== '-' && <Text style={s.metaText}>📍 {distancia}</Text>}
                    </View>
                  </View>
                </View>
                {badge && <View style={{ marginTop: 10 }}><Badge label={badge} /></View>}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container:        { flex: 1, backgroundColor: colors.bg },
  header:           { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: Spacing.xl, paddingBottom: 0 },
  headerTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  location:         { color: colors.muted, fontSize: FontSize.sm },
  greeting:         { color: colors.text, fontSize: FontSize.lg, fontWeight: '800', marginTop: 4 },
  searchBar:        { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: Radius.lg, padding: Spacing.md, gap: 10, marginBottom: Spacing.md },
  searchIcon:       { fontSize: 16, color: colors.muted },
  searchPlaceholder:{ color: colors.muted, fontSize: FontSize.base, flex: 1 },
  cats:             { marginBottom: Spacing.md },
  catChip:          { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 7 },
  catChipActive:    { backgroundColor: colors.green, borderColor: colors.green },
  catText:          { color: colors.muted, fontSize: FontSize.sm, fontWeight: '700' },
  catTextActive:    { color: '#0A0C0E' },
  list:             { padding: Spacing.xl, gap: 12 },
  listHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  listTitle:        { color: colors.text, fontWeight: '800', fontSize: FontSize.base },
  listAll:          { color: colors.green, fontSize: FontSize.sm, fontWeight: '700' },
  card:             { backgroundColor: colors.card, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: colors.border },
  cardRow:          { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  cardIcon:         { width: 56, height: 56, borderRadius: Radius.lg, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  cardInfo:         { flex: 1 },
  cardTop:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName:         { fontWeight: '800', fontSize: FontSize.base, color: colors.text, flex: 1 },
  cardCat:          { color: colors.muted, fontSize: FontSize.sm },
  cardMeta:         { flexDirection: 'row', gap: Spacing.lg, marginTop: 8, flexWrap: 'wrap' },
  metaText:         { color: colors.muted, fontSize: FontSize.xs },
  center:           { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
});
