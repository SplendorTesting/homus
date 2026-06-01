import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts, gradients } from '../theme/colors';

// Elegant animated intro overlay shown once on cold start.
export default function BrandSplash({ onDone }) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const lineW = useRef(new Animated.Value(0)).current;
  const containerFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(lineW, {
        toValue: 1,
        duration: 600,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.delay(550),
      Animated.timing(containerFade, {
        toValue: 0,
        duration: 450,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => onDone?.());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: containerFade }]} pointerEvents="none">
      <LinearGradient colors={gradients.hero} style={StyleSheet.absoluteFill} />
      <Animated.View style={{ opacity: fade, transform: [{ scale }], alignItems: 'center' }}>
        <View style={styles.iconWrap}>
          <LinearGradient
            colors={gradients.gold}
            style={styles.iconCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="content-cut" size={36} color={colors.textOnGold} />
          </LinearGradient>
        </View>
        <Text style={styles.brand}>Trimmer</Text>
        <Animated.View
          style={[
            styles.line,
            { width: lineW.interpolate({ inputRange: [0, 1], outputRange: [0, 64] }) },
          ]}
        />
        <Text style={styles.tagline}>СТУДИЯ ЗАПИСИ</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  brand: {
    fontFamily: fonts.displayBold,
    fontSize: 42,
    color: colors.text,
    letterSpacing: 1,
  },
  line: {
    height: 1.5,
    backgroundColor: colors.primary,
    marginVertical: 14,
    borderRadius: 1,
  },
  tagline: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 4,
    color: colors.primary,
  },
});
