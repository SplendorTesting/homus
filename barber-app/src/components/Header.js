import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fonts, typography } from '../theme/colors';

// Large premium screen header. Optional eyebrow label, back button & right action.
export default function Header({ title, eyebrow, onBack, right, serif = true }) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {onBack ? (
          <Pressable onPress={onBack} style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
        ) : (
          <View style={{ flex: 1 }}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            <Text style={[styles.title, serif && styles.serif]}>{title}</Text>
          </View>
        )}

        {onBack && (
          <View style={styles.centerTitleWrap} pointerEvents="none">
            <Text style={styles.backTitle}>{title}</Text>
          </View>
        )}

        {right ? <View style={styles.right}>{right}</View> : onBack ? <View style={styles.iconBtn} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: 64,
    paddingBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  eyebrow: {
    ...typography.label,
    color: colors.primary,
    marginBottom: 6,
  },
  title: {
    ...typography.h1,
    fontSize: 30,
  },
  serif: {
    fontFamily: fonts.displayBold,
    fontSize: 32,
    letterSpacing: 0.2,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  backTitle: {
    ...typography.h3,
    fontFamily: fonts.semibold,
  },
  right: {
    alignItems: 'flex-end',
  },
  pressed: {
    opacity: 0.6,
  },
});
