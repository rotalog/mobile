import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert, StyleSheet } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
 
export function ContactScreen({ navigation }: { navigation: any }) {
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading]   = useState(false);
 
  const handleEnviar = async () => {
    if (!mensagem.trim()) {
      Alert.alert('Atenção', 'Digite sua mensagem antes de enviar.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    // TODO: await api.post('/api/v1/support', { mensagem })
    setLoading(false);
    setMensagem('');
    Alert.alert('Mensagem enviada!', 'Nossa equipe responderá em até 1 dia útil.');
  };
 
  return (
    <View style={s.container}>
      <TopBar title="Contato" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.list}>
 
        {/* Canais de contato */}
        <Text style={s.section}>— FALE CONOSCO</Text>
        {CANAIS.map(c => (
          <TouchableOpacity key={c.label} style={s.card} onPress={() => Linking.openURL(c.url)} activeOpacity={0.8}>
            <View style={s.canalLeft}>
              <Text style={{ fontSize: 22 }}>{c.icon}</Text>
              <View>
                <Text style={s.canalLabel}>{c.label}</Text>
                <Text style={s.canalSub}>{c.sub}</Text>
              </View>
            </View>
            <Text style={{ color: Colors.muted, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        ))}
 
        {/* Formulário */}
        <Text style={s.section}>— ENVIAR MENSAGEM</Text>
        <View style={s.card}>
          <Text style={s.inputLabel}>Sua mensagem</Text>
          <Input
            value={mensagem}
            onChangeText={setMensagem}
            placeholder="Descreva sua dúvida ou problema..."
            multiline
            numberOfLines={5}
            style={{ height: 120, textAlignVertical: 'top' }}
          />
          <Button label="ENVIAR" onPress={handleEnviar} loading={loading} full />
        </View>
 
        {/* Horário */}
        <View style={[s.card, { borderColor: `${Colors.green}44` }]}>
          <Text style={s.horarioTitle}>⏰ Horário de atendimento</Text>
          <Text style={s.horarioBody}>Segunda a sexta, das 8h às 18h.</Text>
          <Text style={s.horarioBody}>Respondemos em até 1 dia útil.</Text>
        </View>
 
      </ScrollView>
    </View>
  );
}
 
const CANAIS = [
  { icon: '📧', label: 'E-mail',    sub: 'contato@rotalog.com.br',  url: 'mailto:contato@rotalog.com.br' },
  { icon: '💬', label: 'WhatsApp',  sub: '(92) 99999-0000',         url: 'https://wa.me/5592999990000'   },
];
 
const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.bg },
  list:         { padding: Spacing.xl, gap: 10 },
  section:      { fontSize: FontSize.xs, fontWeight: '700', color: Colors.green, letterSpacing: 1.2, marginBottom: 4, marginTop: 4 },
  card:         { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: 8 },
  canalLeft:    { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  canalLabel:   { color: Colors.text, fontWeight: '700', fontSize: FontSize.base },
  canalSub:     { color: Colors.muted, fontSize: FontSize.sm },
  inputLabel:   { color: Colors.muted, fontSize: FontSize.xs, fontWeight: '700' },
  horarioTitle: { color: Colors.green, fontWeight: '700', fontSize: FontSize.sm },
  horarioBody:  { color: Colors.muted, fontSize: FontSize.sm, lineHeight: 20 },
});
