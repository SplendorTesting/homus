import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { colors, spacing } from '../theme/colors';
import { createAppointment, updateAppointment } from '../database/db';
import { scheduleAppointmentReminder } from '../utils/notifications';
import Header from '../components/Header';
import AppointmentForm from '../components/AppointmentForm';
import Button from '../components/Button';

export default function AddAppointmentScreen({ navigation, route }) {
  const initialDate = route?.params?.date;
  const [data, setData] = useState(null);

  const handleSave = async () => {
    if (!data) return;
    if (!data.is_walkin && !data.client_id) {
      Alert.alert('Выберите клиента', 'Укажите клиента из базы или переключитесь на «Гость».');
      return;
    }
    if (data.is_walkin && !data.walkin_name?.trim()) {
      Alert.alert('Введите имя гостя');
      return;
    }

    try {
      const id = await createAppointment({
        client_id: data.client_id,
        date: data.date,
        time_start: data.time_start,
        time_end: data.time_end,
        service: data.service?.trim() || null,
        notes: data.notes?.trim() || null,
        is_walkin: data.is_walkin,
        walkin_name: data.is_walkin ? data.walkin_name.trim() : null,
        reminder_minutes: data.reminder_minutes,
        status: 'scheduled',
      });

      // Schedule a local reminder
      if (data.reminder_minutes >= 0) {
        const notifId = await scheduleAppointmentReminder({
          clientName: data.clientName || 'Клиент',
          service: data.service,
          date: data.date,
          time: data.time_start,
          minutesBefore: data.reminder_minutes,
        });
        if (notifId) {
          await updateAppointment(id, {
            client_id: data.client_id,
            date: data.date,
            time_start: data.time_start,
            time_end: data.time_end,
            service: data.service?.trim() || null,
            notes: data.notes?.trim() || null,
            status: 'scheduled',
            is_walkin: data.is_walkin,
            walkin_name: data.is_walkin ? data.walkin_name.trim() : null,
            notification_id: notifId,
            reminder_minutes: data.reminder_minutes,
          });
        }
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось сохранить запись');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Новая запись" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <AppointmentForm initial={{ date: initialDate }} onChange={setData}>
          <Button title="Создать запись" icon="checkmark" onPress={handleSave} fullWidth size="lg" style={{ marginTop: spacing.sm }} />
        </AppointmentForm>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
