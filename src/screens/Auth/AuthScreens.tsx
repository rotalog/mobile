import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Divider } from '../../components/ui/index';
import { useAuth } from '../../context/AuthContext';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

// ── LOGIN ─────────────────────────────────────────────────────────────────────
type LoginProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export function LoginScreen({ navigation }: LoginProps) {
  const [perfilLocal, setPerfilLocal] = useState<'comprador' | 'entregador'>('comprador');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login, loading, setPerfil } = useAuth();

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <View style={s.logo}>
        <View style={s.logoBox}><Text style={{ fontSize: 32 }}>🚚</Text></View>
        <Text style={s.logoText}>RotaLog</Text>
        <Text style={s.logoSub}>Distribuição inteligente na palma da mão</Text>
      </View>

      {/* Toggle */}
      <View style={s.toggle}>
        <TouchableOpacity
          style={[s.toggleBtn, perfilLocal === 'comprador' && s.toggleBtnActive]}
          onPress={() => { setPerfilLocal('comprador'); setPerfil('BUYER'); }}
        >
          <Text style={[s.toggleTxt, perfilLocal === 'comprador' && s.toggleTxtActive]}>🛒 Comprador</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.toggleBtn, perfilLocal === 'entregador' && s.toggleBtnActive]}
          onPress={() => { setPerfilLocal('entregador'); setPerfil('DRIVER'); }}
        >
          <Text style={[s.toggleTxt, perfilLocal === 'entregador' && s.toggleTxtActive]}>🚚 Entregador</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.hint}>
        {perfilLocal === 'comprador' ? 'Entre como comprador para fazer pedidos' : 'Entre como entregador para ver suas rotas'}
      </Text>

      <Input placeholder="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Input placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />

      <TouchableOpacity onPress={() => navigation.navigate('Recover')} style={s.forgotWrap}>
        <Text style={s.forgot}>Esqueceu a senha?</Text>
      </TouchableOpacity>

      <Button label="ENTRAR" onPress={() => login(email, senha)} full loading={loading} />
      <Divider label="ou" />
      <Button label="CRIAR CONTA DE COMPRADOR" onPress={() => navigation.navigate('Register')} full variant="secondary" />

      <Text style={s.terms}>
        Ao continuar, você aceita os{' '}
        <Text style={{ color: Colors.green }}>Termos de Uso</Text>
      </Text>
    </ScrollView>
  );
}
// ── RECUPERAR SENHA ───────────────────────────────────────────────────────────
type RecoverProps = NativeStackScreenProps<AuthStackParamList, 'Recover'>;
export function RecoverScreen({ navigation }: RecoverProps) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { recoverPassword, loading } = useAuth();

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      {!sent ? (
        <>
          <Text style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>🔐</Text>
          <Text style={s.h2}>Esqueceu a senha?</Text>
          <Text style={s.body}>Insira seu e-mail e enviaremos um link para redefinir sua senha.</Text>
          <Input placeholder="Seu e-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Button label="ENVIAR LINK" onPress={async () => { await recoverPassword(email); setSent(true); }} full loading={loading} />
          <Button label="VOLTAR" onPress={() => navigation.goBack()} full variant="ghost" style={{ marginTop: 8 }} />
        </>
      ) : (
        <View style={s.center}>
          <Text style={{ fontSize: 64, marginBottom: 20 }}>✉️</Text>
          <Text style={[s.h2, { color: Colors.green }]}>E-mail enviado!</Text>
          <Text style={s.body}>Verifique sua caixa de entrada e siga as instruções.</Text>
          <Button label="VOLTAR AO LOGIN" onPress={() => navigation.navigate('Login')} full style={{ marginTop: 24 }} />
        </View>
      )}
    </ScrollView>
  );
}

// ── CADASTRO ──────────────────────────────────────────────────────────────────
type RegisterProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;
export function RegisterScreen({ navigation }: RegisterProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ nome:'', email:'', telefone:'', senha:'', cep:'', rua:'', numero:'', bairro:'', cidade:'' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const { register, loading } = useAuth();

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      {/* Progress */}
      <View style={s.progress}>
        {[1,2].map(i => <View key={i} style={[s.progressBar, { backgroundColor: i <= step ? Colors.green : Colors.border }]} />)}
      </View>
      <Text style={s.section}>{step === 1 ? '— Dados básicos' : '— Endereço de entrega'}</Text>

      {step === 1 ? (
        <>
          <Input placeholder="Nome completo"  value={form.nome}      onChangeText={v => set('nome', v)} />
          <Input placeholder="E-mail"         value={form.email}     onChangeText={v => set('email', v)} keyboardType="email-address" autoCapitalize="none" />
          <Input placeholder="Telefone"       value={form.telefone}  onChangeText={v => set('telefone', v)} keyboardType="phone-pad" />
          <Input placeholder="Senha"          value={form.senha}     onChangeText={v => set('senha', v)} secureTextEntry />
          <Button label="CONTINUAR" onPress={() => setStep(2)} full />
        </>
      ) : (
        <>
          <Input placeholder="CEP"            value={form.cep}       onChangeText={v => set('cep', v)} keyboardType="numeric" />
          <Input placeholder="Rua / Logradouro" value={form.rua}     onChangeText={v => set('rua', v)} />
          <View style={s.row}>
            <View style={{ flex: 1 }}><Input placeholder="Nº"     value={form.numero}  onChangeText={v => set('numero', v)} /></View>
            <View style={{ flex: 2 }}><Input placeholder="Bairro" value={form.bairro}  onChangeText={v => set('bairro', v)} /></View>
          </View>
          <Input placeholder="Cidade"         value={form.cidade}    onChangeText={v => set('cidade', v)} />
          <Button label="CRIAR CONTA" onPress={() => register({ ...form })} full loading={loading} />
          <Text style={s.terms}>
            Já tem conta?{' '}
            <Text style={{ color: Colors.green }} onPress={() => navigation.navigate('Login')}>Entrar</Text>
          </Text>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll:       { flex: 1, backgroundColor: Colors.bg },
  container:    { padding: Spacing.xxl, paddingTop: Spacing.xxxl },
  logo:         { alignItems: 'center', marginBottom: 40 },
  logoBox:      { width: 72, height: 72, borderRadius: 22, backgroundColor: Colors.greenGlow, borderWidth: 2, borderColor: Colors.green, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoText:     { color: Colors.green, fontSize: FontSize.xxl, fontWeight: '900', letterSpacing: -1 },
  logoSub:      { color: Colors.muted, fontSize: FontSize.sm, marginTop: 6 },
  hint:         { color: Colors.muted, fontSize: FontSize.sm, marginBottom: 20 },
  forgotWrap:   { alignItems: 'flex-end', marginBottom: 24 },
  forgot:       { color: Colors.green, fontSize: FontSize.sm, fontWeight: '600' },
  terms:        { textAlign: 'center', color: Colors.muted, fontSize: FontSize.xs, marginTop: 24 },
  h2:           { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800', marginBottom: 8 },
  body:         { color: Colors.muted, fontSize: FontSize.base, lineHeight: 24, marginBottom: 24 },
  center:       { alignItems: 'center' },
  progress:     { flexDirection: 'row', gap: 8, marginBottom: 24 },
  progressBar:  { flex: 1, height: 4, borderRadius: 4 },
  section:      { color: Colors.muted, fontSize: FontSize.sm, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 },
  row:          { flexDirection: 'row', gap: 10 },
  toggle:          { flexDirection: 'row', backgroundColor: Colors.subtle, borderRadius: Radius.lg, padding: 4, marginBottom: 24 },
toggleBtn:       { flex: 1, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center' },
toggleBtnActive: { backgroundColor: Colors.green },
toggleTxt:       { color: Colors.muted, fontWeight: '700', fontSize: FontSize.sm },
toggleTxtActive: { color: '#0A0C0E' },
});
