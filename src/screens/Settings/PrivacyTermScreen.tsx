import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
 
export function PrivacyScreen({ navigation }: { navigation: any }) {
  return (
    <View style={s.container}>
      <TopBar title="Privacidade" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.list}>
 
        <View style={s.card}>
          <Text style={s.version}>Versão 1.0 · Janeiro 2024</Text>
        </View>
 
        {SECTIONS.map(sec => (
          <View key={sec.title} style={s.card}>
            <Text style={s.sectionTitle}>{sec.title}</Text>
            <Text style={s.sectionBody}>{sec.body}</Text>
          </View>
        ))}
 
      </ScrollView>
    </View>
  );
}
 
const SECTIONS = [
  {
    title: '1. Dados coletados',
    body: 'Coletamos nome, e-mail, telefone, endereço de entrega e histórico de pedidos para viabilizar o funcionamento do aplicativo e melhorar sua experiência.',
  },
  {
    title: '2. Uso das informações',
    body: 'Suas informações são usadas exclusivamente para processar pedidos, calcular rotas de entrega e enviar notificações relacionadas ao seu pedido. Não compartilhamos seus dados com terceiros para fins publicitários.',
  },
  {
    title: '3. Localização',
    body: 'A localização é utilizada para exibir fornecedores próximos e acompanhar a entrega em tempo real. Você pode desativar o acesso à localização nas configurações do app a qualquer momento.',
  },
  {
    title: '4. Segurança',
    body: 'Todos os dados são trafegados via HTTPS e armazenados em servidores seguros. Senhas são armazenadas com criptografia e nunca ficam visíveis para nossa equipe.',
  },
  {
    title: '5. Seus direitos',
    body: 'Você pode solicitar a exclusão da sua conta e de todos os seus dados a qualquer momento pelo e-mail contato@rotalog.com.br. Atendemos em até 5 dias úteis.',
  },
  {
    title: '6. Contato',
    body: 'Dúvidas sobre privacidade? Entre em contato: contato@rotalog.com.br',
  },
];
 
const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.bg },
  list:         { padding: Spacing.xl, gap: 10 },
  card:         { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  version:      { color: Colors.muted, fontSize: FontSize.sm, textAlign: 'center' },
  sectionTitle: { color: Colors.text, fontWeight: '800', fontSize: FontSize.base, marginBottom: 8 },
  sectionBody:  { color: Colors.muted, fontSize: FontSize.sm, lineHeight: 22 },
});
