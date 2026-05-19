import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';
import { FontSize, Radius, Spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';

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

export function Button({ label, onPress, variant = 'primary', full, sm, loading, disabled, style }: ButtonProps) {
  const styles = useThemedStyles(buildStyles);
  const { colors } = useTheme();

  const variantStyles = {
    primary:   { bg: colors.green,   text: colors.onPrimary, border: colors.green },
    secondary: { bg: 'transparent',  text: colors.green,     border: colors.green },
    ghost:     { bg: colors.subtle,  text: colors.text,      border: colors.subtle },
    danger:    { bg: colors.danger,  text: '#fff',           border: colors.danger },
  };

  const v = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        { backgroundColor: isDisabled ? colors.subtle : v.bg, borderColor: v.border },
        full && styles.full,
        sm && styles.sm,
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={v.text} size="small" />
        : <Text style={[styles.label, { color: isDisabled ? colors.muted : v.text }, sm && styles.labelSm]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const buildStyles = (c: import('../../theme').ColorPalette) => ({
  base:    { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  full:    { width: '100%' },
  sm:      { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  label:   { fontWeight: '800', fontSize: FontSize.base, letterSpacing: 0.3 },
  labelSm: { fontSize: FontSize.sm },
});
