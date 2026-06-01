import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '../theme/colors';

// A premium surface card with a subtle top-light gradient and hairline border.
export default function Card({ children, style, padding = spacing.lg, gold = false }) {
  return (
    <View style={[styles.wrapper, gold && styles.goldBorder, style]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.045)', 'rgba(255,255,255,0.008)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.gradient, { padding }]}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  goldBorder: {
    borderColor: colors.borderGold,
  },
  gradient: {
    borderRadius: radius.lg,
  },
});
