import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

export default function SettingsScreen() {
  const appVersion = '1.0.0';

  const handleReset = () => {
    Alert.alert(
      'Сброс данных',
      'Все клиенты и записи будут удалены. Это нельзя отменить!',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить всё',
          style: 'destructive',
          onPress: async () => {
            const { getDatabase } = require('../database/db');
            const db = await getDatabase();
            await db.execAsync('DELETE FROM memories; DELETE FROM appointments; DELETE FROM clients;');
            Alert.alert('Готово', 'Все данные удалены');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Настройки</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* App info */}
        <View style={styles.appInfo}>
          <View style={styles.appIcon}>
            <Ionicons name="cut" size={32} color={colors.primary} />
          </View>
          <Text style={styles.appName}>Barber Pro</Text>
          <Text style={styles.appVersion}>Версия {appVersion}</Text>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ДАННЫЕ</Text>

          <TouchableOpacity style={styles.settingRow} onPress={handleReset}>
            <View style={[styles.settingIcon, { backgroundColor: colors.danger + '22' }]}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Очистить все данные</Text>
              <Text style={styles.settingDesc}>Удалить всех клиентов и записи</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>О ПРИЛОЖЕНИИ</Text>

          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: colors.primaryFaded }]}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Barber Pro</Text>
              <Text style={styles.settingDesc}>Приложение для управления записями и клиентами</Text>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: colors.info + '22' }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.info} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Ваши данные в безопасности</Text>
              <Text style={styles.settingDesc}>Все данные хранятся локально на устройстве</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.xl, paddingTop: 60, paddingBottom: spacing.md,
  },
  title: { ...typography.h1 },
  content: { paddingBottom: 100 },
  appInfo: {
    alignItems: 'center', paddingVertical: spacing.xxxl,
  },
  appIcon: {
    width: 72, height: 72, borderRadius: 18,
    backgroundColor: colors.primaryFaded, justifyContent: 'center', alignItems: 'center',
  },
  appName: { ...typography.h2, marginTop: spacing.lg },
  appVersion: { ...typography.caption, marginTop: spacing.xs },
  section: {
    marginHorizontal: spacing.xl, marginTop: spacing.xl,
  },
  sectionLabel: {
    ...typography.caption, color: colors.textMuted, fontWeight: '700',
    letterSpacing: 1, marginBottom: spacing.md, marginLeft: spacing.sm,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.sm,
  },
  settingIcon: {
    width: 40, height: 40, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginRight: spacing.lg,
  },
  settingInfo: { flex: 1 },
  settingTitle: { ...typography.body, fontWeight: '600' },
  settingDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
