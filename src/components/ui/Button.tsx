import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  full?: boolean;
  sm?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const variantStyles = {
  primary:   { bg: Colors.green,   text: '#0A0C0E', border: Colors.green   },
  secondary: { bg: 'transparent',  text: Colors.green, border: Colors.green },
  ghost:     { bg: Colors.subtle,  text: Colors.text,  border: Colors.subtle},
  danger:    { bg: Colors.danger,  text: '#fff',    border: Colors.danger   },
};

export function Button({ label, onPress, variant = 'primary', full, sm, loading, disabled, style }: ButtonProps) {
  const v = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        { backgroundColor: isDisabled ? Colors.subtle : v.bg, borderColor: v.border },
        full && styles.full,
        sm && styles.sm,
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={v.text} size="small" />
        : <Text style={[styles.label, { color: isDisabled ? Colors.muted : v.text }, sm && styles.labelSm]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base:    { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  full:    { width: '100%' },
  sm:      { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  label:   { fontWeight: '800', fontSize: FontSize.base, letterSpacing: 0.3 },
  labelSm: { fontSize: FontSize.sm },
});
