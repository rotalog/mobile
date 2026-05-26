import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ColorPalette, FontSize, Radius, Spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

interface BadgeProps { label: string; color?: string; }
export function Badge({ label, color }: BadgeProps) {
  const { colors } = useTheme();
  const badgeColor = color ?? colors.green;

  return (
    <View style={[staticStyles.badge, { backgroundColor: `${badgeColor}22`, borderColor: `${badgeColor}44` }]}>
      <Text style={[staticStyles.badgeText, { color: badgeColor }]}>{label}</Text>
    </View>
  );
}

interface AvatarProps { size?: number; letter?: string; color?: string; }
export function Avatar({ size = 44, letter = 'U', color }: AvatarProps) {
  const { colors } = useTheme();
  const avatarColor = color ?? colors.green;

  return (
    <View style={[staticStyles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: `${avatarColor}22`, borderColor: avatarColor }]}>
      <Text style={[staticStyles.avatarText, { fontSize: size * 0.4, color: avatarColor }]}>{letter}</Text>
    </View>
  );
}

interface RatingProps { value: number; }
export function Rating({ value }: RatingProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return <Text style={styles.rating}>★ {value}</Text>;
}

interface DividerProps { label?: string; }
export function Divider({ label }: DividerProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={staticStyles.divider}>
      <View style={styles.dividerLine} />
      {label && <Text style={styles.dividerLabel}>{label}</Text>}
      <View style={styles.dividerLine} />
    </View>
  );
}

const staticStyles = StyleSheet.create({
  badge:       { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2, alignSelf: 'flex-start' },
  badgeText:   { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.3 },
  avatar:      { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontWeight: '800' },
  divider:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.lg },
});

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  rating:      { color: colors.warning, fontSize: FontSize.sm, fontWeight: '700' },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerLabel:{ color: colors.muted, fontSize: FontSize.sm },
});
