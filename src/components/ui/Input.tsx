import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { ColorPalette, FontSize, Radius, Spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

interface InputProps extends TextInputProps {
  containerStyle?: object;
}

export function Input({ containerStyle, style, ...props }: InputProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        {...props}
        placeholderTextColor={colors.muted}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        style={[
          styles.input,
          focused && styles.focused,
          style,
        ]}
      />
    </View>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: { marginBottom: Spacing.md },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    color: colors.text,
    fontSize: FontSize.base,
    fontFamily: 'System',
  },
  focused: { borderColor: colors.green },
});
