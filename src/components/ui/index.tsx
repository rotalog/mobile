import React from 'react';
import { View, Text } from 'react-native';
import { FontSize, Radius, Spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';

// ── Badge ─────────────────────────────────────────────────────────────────────
interface BadgeProps { label: string; color?: string; }
export function Badge({ label, color }: BadgeProps) {
  const styles = useThemedStyles(buildStyles);
  const { colors } = useTheme();
  const tint = color ?? colors.green;

  return (
    <View style={[styles.badge, { backgroundColor: `${tint}22`, borderColor: `${tint}44` }]}>
      <Text style={[styles.badgeText, { color: tint }]}>{label}</Text>
    </View>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
interface AvatarProps { size?: number; letter?: string; color?: string; }
export function Avatar({ size = 44, letter = 'U', color }: AvatarProps) {
  const styles = useThemedStyles(buildStyles);
  const { colors } = useTheme();
  const tint = color ?? colors.green;

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: `${tint}22`, borderColor: tint }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.4, color: tint }]}>{letter}</Text>
    </View>
  );
}

// ── Rating ────────────────────────────────────────────────────────────────────
interface RatingProps { value: number; }
export function Rating({ value }: RatingProps) {
  const styles = useThemedStyles(buildStyles);
  return <Text style={styles.rating}>★ {value}</Text>;
}

// ── Divider ───────────────────────────────────────────────────────────────────
interface DividerProps { label?: string; }
export function Divider({ label }: DividerProps) {
  const styles = useThemedStyles(buildStyles);
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      {label && <Text style={styles.dividerLabel}>{label}</Text>}
      <View style={styles.dividerLine} />
    </View>
  );
}

const buildStyles = (c: import('../../theme').ColorPalette) => ({
  badge:       { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2, alignSelf: 'flex-start' },
  badgeText:   { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.3 },
  avatar:      { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontWeight: '800' },
  rating:      { color: c.warning, fontSize: FontSize.sm, fontWeight: '700' },
  divider:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: c.border },
  dividerLabel:{ color: c.muted, fontSize: FontSize.sm },
});
