import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { getDatabase } from './src/database/db';
import { registerForNotifications } from './src/utils/notifications';
import AppNavigator from './src/navigation/AppNavigator';
import BrandSplash from './src/components/BrandSplash';
import { colors } from './src/theme/colors';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [showBrand, setShowBrand] = useState(true);

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  useEffect(() => {
    async function init() {
      try {
        await getDatabase();
        registerForNotifications().catch(() => {});
      } catch (e) {
        console.error('Init error:', e);
      } finally {
        setDbReady(true);
      }
    }
    init();
  }, []);

  const ready = dbReady && fontsLoaded;

  const onLayout = useCallback(async () => {
    if (ready) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  if (!ready) {
    return <View style={styles.container} onLayout={onLayout} />;
  }

  return (
    <GestureHandlerRootView style={styles.container} onLayout={onLayout}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      {showBrand && <BrandSplash onDone={() => setShowBrand(false)} />}
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.surface,
            text: colors.text,
            border: colors.border,
            notification: colors.primary,
          },
        }}
      >
        <AppNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
