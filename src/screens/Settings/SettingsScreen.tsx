import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Avatar, Badge } from '../../components/ui/index';
import { FontSize, Radius, Spacing } from '../../theme';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';

interface Props { navigation: any; logout: () => void; }

export function SettingsScreen({ navigation, logout }: Props) {
  const s = useThemedStyles(buildStyles);
  const { colors, isDark, setDarkMode } = useTheme();
  const { user } = useAuth();
  const [notif, setNotif] = useState(true);
  const [loc, setLoc]     = useState(true);

  useEffect(() => {
    Location.getForegroundPermissionsAsync().then(({ status }) => {
      setLoc(status === 'granted');
    });
  }, []);

  const handleLocToggle = async () => {
    if (loc) {
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

        <View style={s.profileCard}>
          <Avatar size={52} letter="O" />
          <View style={{ flex: 1 }}>
            <Text style={s.profileName}>{user?.name ?? 'Usuário'}</Text>
            <Text style={s.profileEmail}>{user?.email ?? ''}</Text>
            <Badge label="Comprador" />
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={s.editBtn}>
            <Text style={{ color: colors.green, fontWeight: '800', fontSize: FontSize.xs }}>Editar</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.section}>CONTA</Text>
        <Row s={s} colors={colors} icon="📦" label="Meus Pedidos"  sub="Histórico completo"  onPress={() => navigation.navigate('History')} />
        <Row s={s} colors={colors} icon="📌" label="Endereços"     sub="Gerenciar endereços" onPress={() => navigation.navigate('Profile')} />

        <Text style={s.section}>PREFERÊNCIAS</Text>
        <Row s={s} colors={colors} icon="🔔" label="Notificações" sub="Atualizações de pedidos" toggle={() => setNotif(v => !v)} toggled={notif} />
        <Row s={s} colors={colors} icon="📍" label="Localização" sub="Fornecedores próximos" toggle={handleLocToggle} toggled={loc} />
        <Row
          s={s}
          colors={colors}
          icon={isDark ? '🌙' : '☀️'}
          label="Tema escuro"
          sub={isDark ? 'Modo escuro ativado' : 'Modo claro ativado'}
          toggle={() => setDarkMode(!isDark)}
          toggled={isDark}
        />

        <Text style={s.section}>SUPORTE</Text>
        <Row s={s} colors={colors} icon="ℹ️"  label="Sobre o app" sub="RotaLog v1.0.0"  onPress={() => {}} />
        <Row s={s} colors={colors} icon="🛡️" label="Privacidade" sub="Política e termos" onPress={() => navigation.navigate('Privacy')} />
        <Row s={s} colors={colors} icon="📞" label="Contato"     sub="Fale conosco"      onPress={() => navigation.navigate('Contact')} />
        <Text style={s.section}> </Text>
        <Row s={s} colors={colors} icon="⇥" label="Sair da conta" danger onPress={logout} />
      </ScrollView>
    </View>
  );
}

interface RowProps {
  s: Record<string, object>;
  colors: import('../../theme').ColorPalette;
  icon: string; label: string; sub?: string;
  onPress?: () => void; toggle?: () => void; toggled?: boolean; danger?: boolean;
}

function Row({ s, colors, icon, label, sub, onPress, toggle, toggled, danger }: RowProps) {
  return (
    <TouchableOpacity onPress={onPress} style={s.row} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[s.rowIcon, danger && s.rowIconDanger]}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.rowLabel, danger && { color: colors.danger }]}>{label}</Text>
        {sub ? <Text style={s.rowSub}>{sub}</Text> : null}
      </View>
      {toggle && (
        <Switch value={toggled} onValueChange={toggle} trackColor={{ false: colors.subtle, true: colors.green }} thumbColor="#fff" />
      )}
      {onPress && !toggle && <Text style={{ color: colors.muted, fontSize: 18 }}>›</Text>}
    </TouchableOpacity>
  );
}

const buildStyles = (c: import('../../theme').ColorPalette) => ({
  container:    { flex: 1, backgroundColor: c.bg },
  list:         { padding: Spacing.xl, gap: 4 },
  profileCard:  { backgroundColor: c.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: c.border, flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 8 },
  profileName:  { color: c.text, fontWeight: '800', fontSize: FontSize.lg },
  profileEmail: { color: c.muted, fontSize: FontSize.sm, marginBottom: 4 },
  editBtn:      { backgroundColor: `${c.green}22`, borderWidth: 1, borderColor: `${c.green}44`, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  section:      { color: c.muted, fontSize: FontSize.xs, letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase', marginTop: 12, marginBottom: 2 },
  row:          { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.border },
  rowIcon:      { width: 40, height: 40, borderRadius: Radius.md, backgroundColor: c.subtle, alignItems: 'center', justifyContent: 'center' },
  rowIconDanger:{ backgroundColor: `${c.danger}22` },
  rowLabel:     { fontWeight: '700', fontSize: FontSize.base, color: c.text },
  rowSub:       { color: c.muted, fontSize: FontSize.xs },
});
