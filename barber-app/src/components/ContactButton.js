import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { callPhone, openWhatsApp, openTelegram } from '../utils/contacts';

export default function ContactButton({ type, value, size = 40 }) {
  if (!value) return null;

  const config = {
    phone: { icon: 'call', color: colors.phone, action: () => callPhone(value) },
    whatsapp: { icon: 'logo-whatsapp', color: colors.whatsapp, action: () => openWhatsApp(value) },
    telegram: { icon: 'paper-plane', color: colors.telegram, action: () => openTelegram(value) },
  };

  const { icon, color, action } = config[type];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color + '1A',
          borderColor: color + '40',
        },
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
    >
      <Ionicons name={icon} size={size * 0.46} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.92 }],
  },
});
