import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getInitials } from '../utils/contacts';

export default function Avatar({ name, color, size = 48 }) {
  const initials = getInitials(name);
  
  return (
    <View style={[styles.container, { 
      width: size, 
      height: size, 
      borderRadius: size / 2,
      backgroundColor: color || '#D4AF37',
    }]}>
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials}</Text>
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
    fontWeight: '700',
  },
});
