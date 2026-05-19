import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

interface InputProps extends TextInputProps {
  containerStyle?: object;
}

export function Input({ containerStyle, style, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        {...props}
        placeholderTextColor={Colors.muted}
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

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: FontSize.base,
    fontFamily: 'System',
  },
  focused: { borderColor: Colors.green },
});
