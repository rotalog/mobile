import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { TopBar } from '../../components/layout/TopBar';
import { Avatar, Badge } from '../../components/ui/index';
import { ColorPalette, FontSize, Radius, Spacing } from '../../theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

interface Props { navigation: any; logout: () => void; }

export function SettingsScreen({ navigation, logout }: Props) {
  const { user } = useAuth();
  const { isDark, colors, setDarkMode } = useTheme();
  const s = React.useMemo(() => createStyles(colors), [colors]);
  const userName = user?.name ?? (user as { nome?: string } | null)?.nome ?? 'Usuário';
  const [notif, setNotif] = useState(true);
  const [loc, setLoc] = useState(true);

  React.useEffect(() => {
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
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status === 'granted') {
      setLoc(true);
    } else {
      Alert.alert(
        'Permissão negada',
        'Ative a localização nas configurações do celular para usar essa função.'
      );
    }
  };

  return (
    <View style={s.container}>
      <TopBar title="Configurações" />
      <ScrollView contentContainerStyle={s.list}>
        <View style={s.profileCard}>
          <Avatar size={52} letter="O" />
          <View style={{ flex: 1 }}>
            <Text style={s.profileName}>{userName}</Text>
            <Text style={s.profileEmail}>{user?.email ?? ''}</Text>
            <Badge label="Comprador" />
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={s.editBtn}>
            <Text style={s.editBtnText}>Editar</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.section}>CONTA</Text>
        <Row s={s} colors={colors} icon="📦" label="Meus Pedidos" sub="Histórico completo" onPress={() => navigation.navigate('History')} />
        <Row s={s} colors={colors} icon="📌" label="Endereços" sub="Gerenciar endereços" onPress={() => navigation.navigate('Profile')} />

        <Text style={s.section}>PREFERÊNCIAS</Text>
        <Row s={s} colors={colors} icon="🔔" label="Notificações" sub="Atualizações de pedidos" toggle={() => setNotif(v => !v)} toggled={notif} />
        <Row s={s} colors={colors} icon="📍" label="Localização" sub="Fornecedores próximos" toggle={handleLocToggle} toggled={loc} />
        <Row s={s} colors={colors} icon={isDark ? '🌙' : '☀️'} label="Tema escuro" toggle={() => setDarkMode(!isDark)} toggled={isDark} />

        <Text style={s.section}>SUPORTE</Text>
        <Row s={s} colors={colors} icon="ℹ️" label="Sobre o app" sub="RotaLog v1.0.0" onPress={() => {}} />
        <Row s={s} colors={colors} icon="🛡️" label="Privacidade" sub="Política e termos" onPress={() => navigation.navigate('Privacy')} />
        <Row s={s} colors={colors} icon="📞" label="Contato" sub="Fale conosco" onPress={() => navigation.navigate('Contact')} />
        <Text style={s.section}> </Text>
        <Row s={s} colors={colors} icon="⇥" label="Sair da conta" danger onPress={logout} />
      </ScrollView>
    </View>
  );
}

type SettingsStyles = ReturnType<typeof createStyles>;

interface RowProps {
  s: SettingsStyles;
  colors: ColorPalette;
  icon: string;
  label: string;
  sub?: string;
  onPress?: () => void;
  toggle?: () => void;
  toggled?: boolean;
  danger?: boolean;
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
        <Switch
          value={toggled}
          onValueChange={toggle}
          trackColor={{ false: colors.subtle, true: colors.green }}
          thumbColor="#fff"
        />
      )}
      {onPress && !toggle && <Text style={s.chevron}>›</Text>}
    </TouchableOpacity>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { padding: Spacing.xl, gap: 4 },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  profileName: { color: colors.text, fontWeight: '800', fontSize: FontSize.lg },
  profileEmail: { color: colors.muted, fontSize: FontSize.sm, marginBottom: 4 },
  editBtn: {
    backgroundColor: `${colors.green}22`,
    borderWidth: 1,
    borderColor: `${colors.green}44`,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editBtnText: { color: colors.green, fontWeight: '800', fontSize: FontSize.xs },
  section: {
    color: colors.muted,
    fontSize: FontSize.xs,
    letterSpacing: 1,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: colors.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconDanger: { backgroundColor: `${colors.danger}22` },
  rowLabel: { fontWeight: '700', fontSize: FontSize.base, color: colors.text },
  rowSub: { color: colors.muted, fontSize: FontSize.xs },
  chevron: { color: colors.muted, fontSize: 18 },
});
