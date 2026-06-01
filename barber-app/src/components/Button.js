import React from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, gradients, shadows, typography } from '../theme/colors';

export default function Button({
  title,
  onPress,
  icon,
  variant = 'primary', // primary | secondary | ghost | danger
  size = 'md', // sm | md | lg
  style,
  fullWidth = false,
  haptic = true,
}) {
  const handlePress = () => {
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const sizing = {
    sm: { paddingV: 10, paddingH: 16, font: 13, iconSize: 16 },
    md: { paddingV: 15, paddingH: 22, font: 15, iconSize: 18 },
    lg: { paddingV: 18, paddingH: 26, font: 16, iconSize: 20 },
  }[size];

  const content = (textColor) => (
    <View style={styles.row}>
      {icon && <Ionicons name={icon} size={sizing.iconSize} color={textColor} style={styles.icon} />}
      <Text style={[styles.text, { color: textColor, fontSize: sizing.font }]}>{title}</Text>
    </View>
  );

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          { borderRadius: radius.full },
          fullWidth && styles.fullWidth,
          shadows.gold,
          pressed && styles.pressed,
          style,
        ]}
      >
        <LinearGradient
          colors={gradients.gold}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.base, { paddingVertical: sizing.paddingV, paddingHorizontal: sizing.paddingH }]}
        >
          {content(colors.textOnGold)}
        </LinearGradient>
      </Pressable>
    );
  }

  const variantStyle = {
    secondary: { bg: colors.surfaceElevated, border: colors.borderLight, color: colors.text },
    ghost: { bg: 'transparent', border: colors.borderGold, color: colors.primary },
    danger: { bg: 'rgba(217,113,107,0.1)', border: 'rgba(217,113,107,0.35)', color: colors.danger },
  }[variant];

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: variantStyle.bg,
          borderWidth: 1,
          borderColor: variantStyle.border,
          borderRadius: radius.full,
          paddingVertical: sizing.paddingV,
          paddingHorizontal: sizing.paddingH,
        },
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        style,
      ]}
    >
      {content(variantStyle.color)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    fontFamily: typography.button.fontFamily,
    letterSpacing: 0.2,
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
