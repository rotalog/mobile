import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Avatar, Badge } from '../../components/ui/index';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

interface Props { navigation: any; logout: () => void; }

export function SettingsScreen({ navigation, logout }: Props) {
  const {user} = useAuth();
  const [notif, setNotif] = useState(true);
  const [loc, setLoc]     = useState(true);

  // Verifica se já tem permissão ao abrir a tela
React.useEffect(() => {
  Location.getForegroundPermissionsAsync().then(({ status }) => {
    setLoc(status === 'granted');
  });
}, []);

const handleLocToggle = async () => {
  if (loc) {
    // Não dá pra revogar permissão pelo app — redireciona pras configurações do celular
    Alert.alert(
      'Desativar localização',
      'Para desativar, vá em Configurações do celular → RotaLog → Localização.',
      [{ text: 'OK' }]
    );
  } else {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      setLoc(true);
    } else {
      Alert.alert(
        'Permissão negada',
        'Ative a localização nas configurações do celular para usar essa função.'
      );
    }
  }
};

  return (
    <View style={s.container}>
      <TopBar title="Configurações" />
      <ScrollView contentContainerStyle={s.list}>

        {/* Profile card */}
        <View style={s.profileCard}>
          <Avatar size={52} letter="O" />
          <View style={{ flex: 1 }}>
            <Text style={s.profileName}>{user?.name ??'Usuário'}</Text>
            <Text style={s.profileEmail}>{user?.email ?? ''}</Text>
            <Badge label="Comprador" />
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={s.editBtn}>
            <Text style={{ color: Colors.green, fontWeight: '800', fontSize: FontSize.xs }}>Editar</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.section}>CONTA</Text>
        <Row icon="📦" label="Meus Pedidos"  sub="Histórico completo"  onPress={() => navigation.navigate('History')} />
        <Row icon="📌" label="Endereços"     sub="Gerenciar endereços" onPress={() => navigation.navigate('Profile')} />
        <Row icon="💳" label="Pagamento"     sub="Cartões e métodos"   onPress={() => {}} />

        <Text style={s.section}>PREFERÊNCIAS</Text>
        <Row icon="🔔" label="Notificações" sub="Atualizações de pedidos" toggle={() => setNotif(v => !v)} toggled={notif} />
        <Row icon="📍" label="Localização" sub="Fornecedores próximos" toggle={handleLocToggle} toggled={loc} />
        <Row icon="🌙" label="Tema escuro"  sub="Sempre ativado"           toggle={() => {}}               toggled={true}  />

        <Text style={s.section}>SUPORTE</Text>
        <Row icon="ℹ️"  label="Sobre o app" sub="RotaLog v1.0.0"  onPress={() => {}} />
        <Row icon="🛡️" label="Privacidade" sub="Política e termos" onPress={() => navigation.navigate('Privacy')} />
        <Row icon="📞" label="Contato"     sub="Fale conosco"      onPress={() => navigation.navigate('Contact')} />
        <Text style={s.section}> </Text>
        <Row icon="⇥" label="Sair da conta" danger onPress={logout} />
      </ScrollView>
    </View>
  );
}

interface RowProps {
  icon: string; label: string; sub?: string;
  onPress?: () => void; toggle?: () => void; toggled?: boolean; danger?: boolean;
}

function Row({ icon, label, sub, onPress, toggle, toggled, danger }: RowProps) {
  return (
    <TouchableOpacity onPress={onPress} style={s.row} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[s.rowIcon, danger && s.rowIconDanger]}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.rowLabel, danger && { color: Colors.danger }]}>{label}</Text>
        {sub ? <Text style={s.rowSub}>{sub}</Text> : null}
      </View>
      {toggle && (
        <Switch value={toggled} onValueChange={toggle} trackColor={{ false: Colors.subtle, true: Colors.green }} thumbColor="#fff" />
      )}
      {onPress && !toggle && <Text style={{ color: Colors.muted, fontSize: 18 }}>›</Text>}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.bg },
  list:         { padding: Spacing.xl, gap: 4 },
  profileCard:  { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 8 },
  profileName:  { color: Colors.text, fontWeight: '800', fontSize: FontSize.lg },
  profileEmail: { color: Colors.muted, fontSize: FontSize.sm, marginBottom: 4 },
  editBtn:      { backgroundColor: `${Colors.green}22`, borderWidth: 1, borderColor: `${Colors.green}44`, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  section:      { color: Colors.muted, fontSize: FontSize.xs, letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase', marginTop: 12, marginBottom: 2 },
  row:          { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowIcon:      { width: 40, height: 40, borderRadius: Radius.md, backgroundColor: Colors.subtle, alignItems: 'center', justifyContent: 'center' },
  rowIconDanger:{ backgroundColor: `${Colors.danger}22` },
  rowLabel:     { fontWeight: '700', fontSize: FontSize.base, color: Colors.text },
  rowSub:       { color: Colors.muted, fontSize: FontSize.xs },
});
