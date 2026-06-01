import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, fonts, typography } from '../theme/colors';
import { getAppointment, getClient, updateAppointment, deleteAppointment } from '../database/db';
import { scheduleAppointmentReminder, cancelReminder } from '../utils/notifications';
import Header from '../components/Header';
import AppointmentForm from '../components/AppointmentForm';
import Button from '../components/Button';

const STATUS = [
  { key: 'scheduled', label: 'Активна', color: colors.primary, icon: 'time' },
  { key: 'completed', label: 'Завершена', color: colors.success, icon: 'checkmark-circle' },
  { key: 'cancelled', label: 'Отменена', color: colors.danger, icon: 'close-circle' },
];

export default function EditAppointmentScreen({ navigation, route }) {
  const { appointmentId } = route.params || {};
  const [initial, setInitial] = useState(null);
  const [oldNotifId, setOldNotifId] = useState(null);
  const [status, setStatus] = useState('scheduled');
  const [data, setData] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const apt = await getAppointment(appointmentId);
    if (!apt) { navigation.goBack(); return; }
    let client = null;
    if (apt.client_id) client = await getClient(apt.client_id);
    setOldNotifId(apt.notification_id);
    setStatus(apt.status || 'scheduled');
    setInitial({
      client,
      date: apt.date,
      time_start: apt.time_start,
      time_end: apt.time_end,
      service: apt.service,
      notes: apt.notes,
      is_walkin: !!apt.is_walkin,
      walkin_name: apt.walkin_name,
      reminder_minutes: apt.reminder_minutes ?? 60,
    });
  };

  const handleSave = async () => {
    if (!data) return;
    if (!data.is_walkin && !data.client_id) { Alert.alert('Выберите клиента'); return; }
    if (data.is_walkin && !data.walkin_name?.trim()) { Alert.alert('Введите имя гостя'); return; }

    // Reschedule notification
    await cancelReminder(oldNotifId);
    let notifId = null;
    if (status === 'scheduled' && data.reminder_minutes >= 0) {
      notifId = await scheduleAppointmentReminder({
        clientName: data.clientName || 'Клиент',
        service: data.service,
        date: data.date,
        time: data.time_start,
        minutesBefore: data.reminder_minutes,
      });
    }

    await updateAppointment(appointmentId, {
      client_id: data.client_id,
      date: data.date,
      time_start: data.time_start,
      time_end: data.time_end,
      service: data.service?.trim() || null,
      notes: data.notes?.trim() || null,
      status,
      is_walkin: data.is_walkin,
      walkin_name: data.is_walkin ? data.walkin_name.trim() : null,
      notification_id: notifId,
      reminder_minutes: data.reminder_minutes,
    });
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert('Удалить запись?', 'Это действие нельзя отменить.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить', style: 'destructive',
        onPress: async () => {
          await cancelReminder(oldNotifId);
          await deleteAppointment(appointmentId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (!initial) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <Header title="Запись" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <AppointmentForm initial={initial} onChange={setData}>
          {/* Status selector */}
          <View style={styles.statusBlock}>
            <Text style={styles.statusLabel}>Статус</Text>
            <View style={styles.statusRow}>
              {STATUS.map(s => {
                const active = status === s.key;
                return (
                  <Pressable
                    key={s.key}
                    style={[styles.statusChip, active && { backgroundColor: s.color + '1F', borderColor: s.color }]}
                    onPress={() => { Haptics.selectionAsync(); setStatus(s.key); }}
                  >
                    <Ionicons name={s.icon} size={15} color={active ? s.color : colors.textMuted} />
                    <Text style={[styles.statusText, active && { color: s.color }]}>{s.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Button title="Сохранить" icon="checkmark" onPress={handleSave} fullWidth size="lg" style={{ marginTop: spacing.lg }} />
          <Button title="Удалить запись" icon="trash-outline" variant="danger" onPress={handleDelete} fullWidth style={{ marginTop: spacing.md }} />
        </AppointmentForm>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  statusBlock: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md,
  },
  statusLabel: { ...typography.label, color: colors.textSecondary, letterSpacing: 0.8 },
  statusRow: { flexDirection: 'row', gap: spacing.sm },
  statusChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    paddingVertical: 12, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceLight,
  },
  statusText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted },
});
