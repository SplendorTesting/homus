import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getInitials } from '../utils/contacts';
import { fonts, colors } from '../theme/colors';

// Derive a tasteful 2-stop gradient from a stored base color.
function toGradient(hex) {
  const base = hex || colors.primary;
  return [shade(base, 28), shade(base, -18)];
}

function shade(hex, percent) {
  try {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const adj = (c) => Math.max(0, Math.min(255, Math.round(c + (percent / 100) * 255)));
    return `rgb(${adj(r)}, ${adj(g)}, ${adj(b)})`;
  } catch {
    return hex;
  }
}

export default function Avatar({ name, color, size = 48, ring = false }) {
  const initials = getInitials(name);
  const grad = toGradient(color);

  const inner = (
    <LinearGradient
      colors={grad}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials}</Text>
    </LinearGradient>
  );

  if (!ring) return inner;

  return (
    <View
      style={[
        styles.ring,
        { width: size + 6, height: size + 6, borderRadius: (size + 6) / 2 },
      ]}
    >
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontFamily: fonts.heading,
  },
  ring: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderGold,
  },
});
