import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Button } from '../../components/ui/Button';
import { Produto } from '../../data/mock';
import { ColorPalette, FontSize, Radius, Spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

interface Props { navigation: any; route: any; addToCart: (p: Produto) => void; }

export function SupplierScreen({ navigation, route, addToCart }: Props) {
  const { colors } = useTheme();
  const s = React.useMemo(() => createStyles(colors), [colors]);
  const fornecedor = route?.params?.fornecedor ?? {};
  const supplierId = fornecedor.id;

  const nome      = fornecedor.name      ?? fornecedor.nome      ?? '';
  const categoria = fornecedor.category  ?? fornecedor.categoria ?? '';
  const nota      = fornecedor.rating    ?? fornecedor.nota      ?? 0;
  const entregas  = fornecedor.deliveries ?? fornecedor.entregas ?? 0;
  const distancia = fornecedor.distance  ?? fornecedor.distancia ?? '-';
  const tempo     = fornecedor.deliveryTime ?? fornecedor.tempo  ?? '-';
  const img       = fornecedor.img       ?? '🏪';
  const cor       = fornecedor.cor       ?? colors.green;

  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const { data } = await api.get(`/api/v1/suppliers/${supplierId}/products`);
        const list = Array.isArray(data) ? data : data.content ?? data.products ?? [];
        setProdutos(list);
      } catch {
        setProdutos([]);
      } finally {
        setLoading(false);
      }
    }
    if (supplierId) {
      loadProducts();
    } else {
      setLoading(false);
    }
  }, [supplierId]);

  const toCartItem = (p: any): Produto => ({
    id: p.id,
    nome: p.name ?? p.nome ?? '',
    preco: p.price ?? p.preco ?? 0,
    unidade: p.unit ?? p.unidade ?? 'un',
    fornecedor: nome,
    img: p.img ?? '📦',
    categoria: p.category ?? p.categoria ?? '',
    estoque: (p.stockQuantity ?? p.quantity ?? p.estoque ?? 1) > 0,
  });

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
          {tempo !== '-' && (
            <View style={s.etaBadge}>
              <Text style={s.etaTxt}>🕐 Entrega estimada: <Text style={{ color: colors.text, fontWeight: '700' }}>{tempo}</Text></Text>
            </View>
          )}
        </View>

        {/* Produtos */}
        <Text style={s.section}>— PRODUTOS DISPONÍVEIS</Text>
        {loading ? (
          <ActivityIndicator color={colors.green} style={{ marginTop: 20 }} />
        ) : produtos.length === 0 ? (
          <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 20 }}>
            Nenhum produto disponível.
          </Text>
        ) : (
          <View style={s.grid}>
            {produtos.map(p => {
              const item = toCartItem(p);
              return (
                <View key={p.id} style={s.prodCard}>
                  <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: 8 }}>{item.img}</Text>
                  <Text style={s.prodName} numberOfLines={2}>{item.nome}</Text>
                  <Text style={s.prodPrice}>R$ {item.preco.toFixed(2)}/{item.unidade}</Text>
                  {item.estoque
                    ? <Button label="+ Adicionar" onPress={() => addToCart(item)} sm full style={{ marginTop: 8 }} />
                    : <Button label="Indisponível" onPress={() => {}} sm full disabled style={{ marginTop: 8 }} />
                  }
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll:    { padding: Spacing.xl, gap: 16 },
  hero:      { alignItems: 'center', borderRadius: Radius.xl, padding: Spacing.xl },
  name:      { color: colors.text, fontSize: FontSize.xl, fontWeight: '900', marginBottom: 4 },
  cat:       { color: colors.muted, marginBottom: 12 },
  stats:     { flexDirection: 'row', gap: 32, marginBottom: 12 },
  statVal:   { color: colors.green, fontWeight: '900', fontSize: FontSize.lg, textAlign: 'center' },
  statKey:   { color: colors.muted, fontSize: FontSize.xs },
  etaBadge:  { backgroundColor: colors.card, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, borderWidth: 1, borderColor: colors.border },
  etaTxt:    { color: colors.muted, fontSize: FontSize.sm },
  section:   { color: colors.muted, fontSize: FontSize.xs, letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase' },
  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  prodCard:  { flex: 1, minWidth: '45%', backgroundColor: colors.card, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: colors.border },
  prodName:  { color: colors.text, fontWeight: '700', fontSize: FontSize.sm, marginBottom: 4 },
  prodPrice: { color: colors.green, fontWeight: '800', fontSize: FontSize.sm },
});
