import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

interface TopBarProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  transparent?: boolean;
}

export function TopBar({ title, onBack, right, transparent }: TopBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[
      styles.container,
      { paddingTop: insets.top + Spacing.sm },
      transparent ? styles.transparent : styles.solid,
    ]}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      {right ?? <View style={styles.placeholder} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md },
  solid:       { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  transparent: { backgroundColor: 'transparent' },
  backBtn:     { width: 38, height: 38, borderRadius: Radius.md, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  backIcon:    { color: Colors.text, fontSize: 18 },
  title:       { flex: 1, fontWeight: '800', fontSize: FontSize.md, color: Colors.text },
  placeholder: { width: 38 },
});
