import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

// ── Badge ─────────────────────────────────────────────────────────────────────
interface BadgeProps { label: string; color?: string; }
export function Badge({ label, color = Colors.green }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: `${color}44` }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
interface AvatarProps { size?: number; letter?: string; color?: string; }
export function Avatar({ size = 44, letter = 'U', color = Colors.green }: AvatarProps) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: `${color}22`, borderColor: color }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.4, color }]}>{letter}</Text>
    </View>
  );
}

// ── Rating ────────────────────────────────────────────────────────────────────
interface RatingProps { value: number; }
export function Rating({ value }: RatingProps) {
  return <Text style={styles.rating}>★ {value}</Text>;
}

// ── Divider ───────────────────────────────────────────────────────────────────
interface DividerProps { label?: string; }
export function Divider({ label }: DividerProps) {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      {label && <Text style={styles.dividerLabel}>{label}</Text>}
      <View style={styles.dividerLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge:       { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2, alignSelf: 'flex-start' },
  badgeText:   { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.3 },
  avatar:      { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontWeight: '800' },
  rating:      { color: Colors.warning, fontSize: FontSize.sm, fontWeight: '700' },
  divider:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerLabel:{ color: Colors.muted, fontSize: FontSize.sm },
});
