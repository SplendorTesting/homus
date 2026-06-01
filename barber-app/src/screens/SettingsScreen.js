import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, fonts, typography, gradients } from '../theme/colors';
import { getSetting, setSetting, getDatabase } from '../database/db';
import { registerForNotifications, sendTestNotification, getPermissionStatus, getScheduledCount } from '../utils/notifications';
import { REMINDER_OPTIONS } from '../utils/contacts';

export default function SettingsScreen() {
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [defaultReminder, setDefaultReminder] = useState(60);
  const [permission, setPermission] = useState('undetermined');
  const [scheduled, setScheduled] = useState(0);

  const load = useCallback(async () => {
    setRemindersEnabled((await getSetting('reminders_enabled', '1')) === '1');
    setDefaultReminder(parseInt(await getSetting('reminder_minutes', '60'), 10));
    setPermission(await getPermissionStatus());
    setScheduled(await getScheduledCount());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggleReminders = async (val) => {
    Haptics.selectionAsync();
    setRemindersEnabled(val);
    await setSetting('reminders_enabled', val ? '1' : '0');
    if (val) {
      const granted = await registerForNotifications();
      setPermission(await getPermissionStatus());
      if (!granted) {
        Alert.alert('Разрешение нужно', 'Чтобы получать напоминания, разрешите уведомления в настройках устройства.');
      }
    }
  };

  const pickReminder = async (minutes) => {
    Haptics.selectionAsync();
    setDefaultReminder(minutes);
    await setSetting('reminder_minutes', minutes);
  };

  const handleTest = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const granted = await registerForNotifications();
    if (granted) {
      await sendTestNotification();
      Alert.alert('Отправлено', 'Уведомление придёт через несколько секунд.');
    } else {
      Alert.alert('Нет разрешения', 'Включите уведомления для приложения в настройках устройства.');
    }
  };

  const handleReset = () => {
    Alert.alert('Очистить все данные?', 'Все клиенты, записи и воспоминания будут удалены безвозвратно.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить всё', style: 'destructive',
        onPress: async () => {
          const db = await getDatabase();
          await db.execAsync('DELETE FROM memories; DELETE FROM appointments; DELETE FROM clients;');
          Alert.alert('Готово', 'Все данные удалены.');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Brand header */}
        <LinearGradient colors={gradients.hero} style={styles.brandCard}>
          <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.brandIcon}>
            <MaterialCommunityIcons name="content-cut" size={28} color={colors.textOnGold} />
          </LinearGradient>
          <Text style={styles.brandName}>Trimmer</Text>
          <Text style={styles.brandTag}>СТУДИЯ ЗАПИСИ · v1.0</Text>
        </LinearGradient>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Уведомления</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: colors.primaryFaded }]}>
              <Ionicons name="notifications" size={18} color={colors.primary} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Напоминания о записях</Text>
              <Text style={styles.rowDesc}>Уведомление перед визитом клиента</Text>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={toggleReminders}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>

          {remindersEnabled && (
            <>
              <View style={styles.divider} />
              <Text style={styles.subLabel}>НАПОМИНАТЬ ПО УМОЛЧАНИЮ</Text>
              <View style={styles.chipGrid}>
                {REMINDER_OPTIONS.filter(o => o.minutes >= 0).map(opt => (
                  <Pressable
                    key={opt.minutes}
                    style={[styles.chip, defaultReminder === opt.minutes && styles.chipActive]}
                    onPress={() => pickReminder(opt.minutes)}
                  >
                    <Text style={[styles.chipText, defaultReminder === opt.minutes && styles.chipTextActive]}>{opt.short}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </View>

        <Pressable style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]} onPress={handleTest}>
          <View style={[styles.rowIcon, { backgroundColor: colors.info + '1A' }]}>
            <Ionicons name="paper-plane-outline" size={18} color={colors.info} />
          </View>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Проверить уведомление</Text>
            <Text style={styles.rowDesc}>{scheduled} запланированных напоминаний</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        {/* Data */}
        <Text style={styles.sectionTitle}>Данные</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: colors.success + '1A' }]}>
              <Ionicons name="lock-closed" size={18} color={colors.success} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Локальное хранение</Text>
              <Text style={styles.rowDesc}>Все данные хранятся только на этом устройстве</Text>
            </View>
          </View>
        </View>

        <Pressable style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]} onPress={handleReset}>
          <View style={[styles.rowIcon, { backgroundColor: colors.danger + '1A' }]}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </View>
          <View style={styles.rowInfo}>
            <Text style={[styles.rowTitle, { color: colors.danger }]}>Очистить все данные</Text>
            <Text style={styles.rowDesc}>Удалить клиентов, записи и заметки</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        <Text style={styles.footer}>Сделано с любовью к ремеслу ✦</Text>
        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 20 },
  brandCard: {
    alignItems: 'center',
    paddingTop: 76,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  brandIcon: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOpacity: 0.5, shadowRadius: 18, shadowOffset: { width: 0, height: 0 }, elevation: 8,
  },
  brandName: { fontFamily: fonts.displayBold, fontSize: 28, color: colors.text, marginTop: spacing.md },
  brandTag: { fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 3, color: colors.primary, marginTop: 4 },
  sectionTitle: {
    fontFamily: fonts.displayBold, fontSize: 18, color: colors.text,
    marginTop: spacing.xxl, marginBottom: spacing.md, marginHorizontal: spacing.xl,
  },
  card: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.xl, marginTop: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: spacing.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  rowInfo: { flex: 1 },
  rowTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  rowDesc: { ...typography.caption, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  subLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.md },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg, paddingVertical: 9,
    backgroundColor: colors.surfaceLight, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textSecondary },
  chipTextActive: { color: colors.textOnGold },
  footer: { ...typography.caption, textAlign: 'center', marginTop: spacing.xxl, color: colors.textMuted },
  pressed: { opacity: 0.8 },
});
