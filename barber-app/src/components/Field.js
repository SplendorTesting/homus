import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, fonts, typography } from '../theme/colors';

export default function Field({
  label,
  icon,
  iconColor = colors.primary,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType,
  autoFocus,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      {label ? (
        <View style={styles.labelRow}>
          {icon ? <Ionicons name={icon} size={14} color={iconColor} /> : null}
          <Text style={styles.label}>{label}</Text>
        </View>
      ) : null}
      <TextInput
        style={[styles.input, multiline && styles.textArea, focused && styles.inputFocused]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        keyboardType={keyboardType}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { ...typography.label, color: colors.textSecondary, letterSpacing: 0.8 },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  inputFocused: { borderColor: colors.borderGold },
  textArea: { minHeight: 90, textAlignVertical: 'top', paddingTop: 14 },
});
