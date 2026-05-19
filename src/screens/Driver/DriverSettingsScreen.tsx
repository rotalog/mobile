import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Avatar, Badge } from '../../components/ui/index';
import { Button } from '../../components/ui/Button';
import { FontSize, Radius, Spacing } from '../../theme';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import * as Location from 'expo-location';

// ── Component ─────────────────────────────────────────────────────────────────
export function DriverSettingsScreen({ navigation }: { navigation: any }) {
  const s = useThemedStyles(buildStyles);
  const { colors, isDark, setDarkMode } = useTheme();

  const { user, logout } = useAuth();

  const nome  = user?.name ?? 'Entregador';
  const email = user?.email ?? '';

  const [notif, setNotif] = useState(true);
const [loc, setLoc]     = useState(false);

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
      Alert.alert('Permissão negada', 'Ative a localização nas configurações do celular.');
    }
  }
};

  return (
    <View style={s.container}>
      <TopBar title="Configurações" />

      <ScrollView contentContainerStyle={s.list}>

        {/* Avatar */}
        <View style={s.avatarWrap}>
          <Avatar size={80} letter={nome.charAt(0)} />
          <Text style={s.nome}>{nome}</Text>
          <Text style={s.email}>{email}</Text>
          <Badge label="Entregador" color={colors.green} />
        </View>

        {/* Stats do dia */}
        <Text style={s.sectionLabel}>— HOJE</Text>
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statVal}>0</Text>
            <Text style={s.statLabel}>Entregas</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statVal}>0 km</Text>
            <Text style={s.statLabel}>Rodados</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statVal}>-</Text>
            <Text style={s.statLabel}>Taxa</Text>
          </View>
        </View>

        {/* Menu */}
        <Text style={s.sectionLabel}>— CONTA</Text>
        <View style={s.menuCard}>
          <Row icon="👤" label="Meu Perfil"      onPress={() => navigation.navigate('ProfileScreen')} />
           <Row icon="🛡️" label="Privacidade"  onPress={() => navigation.navigate('Privacy')} />
        <Row icon="📞" label="Contato"       onPress={() => navigation.navigate('Contact')} />
          <Row icon="🔔" label="Notificações"  toggle={() => setNotif(v => !v)} toggled={notif} />
        <Row icon="📍" label="Localização" toggle={handleLocToggle} toggled={loc} />
        <Row icon={isDark ? '🌙' : '☀️'} label="Tema escuro" toggle={() => setDarkMode(!isDark)} toggled={isDark} />

        </View>

        <View style={{ marginTop: 8 }}>
          <Button
            label="SAIR DA CONTA"
            onPress={logout}
            variant="danger"
            full
          />
        </View>

      </ScrollView>
    </View>
  );
}
// ── Row helper ────────────────────────────────────────────────────────────────
function Row({
  icon,
  label,
  onPress,
  toggle,
  toggled,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
  toggle?: () => void;
  toggled?: boolean;
}) {
  const s = useThemedStyles(buildStyles);
  const { colors } = useTheme();
  const action = onPress ?? toggle;

  return (
    <TouchableOpacity onPress={action} style={s.row} activeOpacity={0.7}>
      <View style={s.rowIcon}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <Text style={s.rowLabel}>{label}</Text>
      {toggle ? (
        <Switch
          value={!!toggled}
          onValueChange={toggle}
          trackColor={{ false: colors.subtle, true: colors.green }}
          thumbColor="#fff"
        />
      ) : (
        <Text style={{ color: colors.muted, fontSize: 18 }}>›</Text>
      )}
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const buildStyles = (c: import('../../theme').ColorPalette) => ({
  container:    { flex: 1, backgroundColor: c.bg },
  list:         { padding: Spacing.xl, gap: 14 },

  avatarWrap:   { alignItems: 'center', gap: 6, paddingVertical: Spacing.lg },
  nome:         { color: c.text, fontWeight: '800', fontSize: FontSize.xl },
  email:        { color: c.muted, fontSize: FontSize.sm },

  sectionLabel: { fontSize: FontSize.xs, fontWeight: '700', color: c.green, letterSpacing: 1.2 },

  statsRow:     { flexDirection: 'row', gap: 10 },
  statCard:     { flex: 1, backgroundColor: c.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: c.border, alignItems: 'center', gap: 4 },
  statVal:      { color: c.green, fontWeight: '900', fontSize: FontSize.lg },
  statLabel:    { color: c.muted, fontSize: FontSize.xs },

  menuCard:     { backgroundColor: c.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: c.border },
  row:          { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: Spacing.md, borderBottomWidth: 1, borderBottomColor: c.border },
  rowIcon:      { width: 36, height: 36, borderRadius: Radius.md, backgroundColor: c.subtle, alignItems: 'center', justifyContent: 'center' },
  rowLabel:     { flex: 1, fontWeight: '700', fontSize: FontSize.base, color: c.text },
});
