import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { callPhone, openWhatsApp, openTelegram } from '../utils/contacts';

export default function ContactButton({ type, value, size = 36 }) {
  if (!value) return null;

  const config = {
    phone: { icon: 'call', color: colors.phone, action: () => callPhone(value) },
    whatsapp: { icon: 'logo-whatsapp', color: colors.whatsapp, action: () => openWhatsApp(value) },
    telegram: { icon: 'paper-plane', color: colors.telegram, action: () => openTelegram(value) },
  };

  const { icon, color, action } = config[type];

  return (
    <TouchableOpacity
      style={[styles.button, { width: size, height: size, borderRadius: size / 2, backgroundColor: color + '22' }]}
      onPress={action}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={size * 0.5} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
});
