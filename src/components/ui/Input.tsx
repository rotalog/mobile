import React, { useState } from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { FontSize, Radius, Spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';

interface InputProps extends TextInputProps {
  containerStyle?: object;
}

export function Input({ containerStyle, style, ...props }: InputProps) {
  const styles = useThemedStyles(buildStyles);
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        {...props}
        placeholderTextColor={colors.muted}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        style={[styles.input, focused && styles.focused, style]}
      />
    </View>
  );
}

const buildStyles = (c: import('../../theme').ColorPalette) => ({
  container: { marginBottom: Spacing.md },
  input: {
    backgroundColor: c.card,
    borderWidth: 1.5,
    borderColor: c.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    color: c.text,
    fontSize: FontSize.base,
    fontFamily: 'System',
  },
  focused: { borderColor: c.green },
});
