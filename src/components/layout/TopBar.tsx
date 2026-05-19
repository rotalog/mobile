import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontSize, Radius, Spacing } from '../../theme';
import { useThemedStyles } from '../../hooks/useThemedStyles';

interface TopBarProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  transparent?: boolean;
}

export function TopBar({ title, onBack, right, transparent }: TopBarProps) {
  const styles = useThemedStyles(buildStyles);
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

const buildStyles = (c: import('../../theme').ColorPalette) => ({
  container:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md },
  solid:       { backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.border },
  transparent: { backgroundColor: 'transparent' },
  backBtn:     { width: 38, height: 38, borderRadius: Radius.md, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  backIcon:    { color: c.text, fontSize: 18 },
  title:       { flex: 1, fontWeight: '800', fontSize: FontSize.md, color: c.text },
  placeholder: { width: 38 },
});
