import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
import { createAppointment, getAllClients } from '../database/db';
import { getTodayString } from '../utils/contacts';
import Avatar from '../components/Avatar';

const TIME_SLOTS = [];
for (let h = 8; h <= 21; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

export default function AddAppointmentScreen({ navigation, route }) {
  const initialDate = route?.params?.date || getTodayString();
  
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [date, setDate] = useState(initialDate);
  const [timeStart, setTimeStart] = useState('10:00');
  const [timeEnd, setTimeEnd] = useState('11:00');
  const [service, setService] = useState('');
  const [notes, setNotes] = useState('');
  const [isWalkin, setIsWalkin] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const data = await getAllClients();
    setClients(data);
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const handleSave = async () => {
    if (!isWalkin && !selectedClient) {
      Alert.alert('Ошибка', 'Выберите клиента или отметьте как проходящего');
      return;
    }
    if (isWalkin && !walkinName.trim()) {
      Alert.alert('Ошибка', 'Введите имя проходящего клиента');
      return;
    }

    try {
      await createAppointment({
        client_id: isWalkin ? null : selectedClient.id,
        date,
        time_start: timeStart,
        time_end: timeEnd,
        service: service.trim() || null,
        notes: notes.trim() || null,
        is_walkin: isWalkin,
        walkin_name: isWalkin ? walkinName.trim() : null,
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось сохранить запись');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Новая запись</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Сохранить</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        {/* Walk-in toggle */}
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>Проходящий клиент</Text>
            <Text style={styles.hint}>Без записи в базу</Text>
          </View>
          <Switch
            value={isWalkin}
            onValueChange={setIsWalkin}
            trackColor={{ false: colors.border, true: colors.primaryFaded }}
            thumbColor={isWalkin ? colors.primary : colors.textMuted}
          />
        </View>

        {/* Client selection */}
        {isWalkin ? (
          <View style={styles.field}>
            <Text style={styles.label}>Имя</Text>
            <TextInput
              style={styles.input}
              value={walkinName}
              onChangeText={setWalkinName}
              placeholder="Имя клиента"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        ) : (
          <View style={styles.field}>
            <Text style={styles.label}>Клиент</Text>
            <TouchableOpacity
              style={styles.clientSelector}
              onPress={() => setShowClientPicker(!showClientPicker)}
            >
              {selectedClient ? (
                <View style={styles.selectedClient}>
                  <Avatar name={selectedClient.name} color={selectedClient.avatar_color} size={32} />
                  <Text style={styles.selectedClientName}>{selectedClient.name}</Text>
                </View>
              ) : (
                <Text style={styles.placeholderText}>Выбрать клиента</Text>
              )}
              <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            {showClientPicker && (
              <View style={styles.clientList}>
                <TextInput
                  style={styles.searchInput}
                  value={clientSearch}
                  onChangeText={setClientSearch}
                  placeholder="Поиск..."
                  placeholderTextColor={colors.textMuted}
                />
                <ScrollView style={styles.clientScroll} nestedScrollEnabled>
                  {filteredClients.map(client => (
                    <TouchableOpacity
                      key={client.id}
                      style={styles.clientOption}
                      onPress={() => {
                        setSelectedClient(client);
                        setShowClientPicker(false);
                        setClientSearch('');
                      }}
                    >
                      <Avatar name={client.name} color={client.avatar_color} size={32} />
                      <Text style={styles.clientOptionName}>{client.name}</Text>
                    </TouchableOpacity>
                  ))}
                  {filteredClients.length === 0 && (
                    <Text style={styles.noResults}>Нет результатов</Text>
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Date */}
        <View style={styles.field}>
          <Text style={styles.label}>Дата</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="ГГГГ-ММ-ДД"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Time */}
        <View style={styles.timeRow}>
          <View style={styles.timeField}>
            <Text style={styles.label}>Начало</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timePicker}>
              {TIME_SLOTS.map(t => (
                <TouchableOpacity
                  key={`start-${t}`}
                  style={[styles.timeChip, timeStart === t && styles.timeChipActive]}
                  onPress={() => setTimeStart(t)}
                >
                  <Text style={[styles.timeChipText, timeStart === t && styles.timeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.timeField}>
            <Text style={styles.label}>Конец</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timePicker}>
              {TIME_SLOTS.map(t => (
                <TouchableOpacity
                  key={`end-${t}`}
                  style={[styles.timeChip, timeEnd === t && styles.timeChipActive]}
                  onPress={() => setTimeEnd(t)}
                >
                  <Text style={[styles.timeChipText, timeEnd === t && styles.timeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Service */}
        <View style={styles.field}>
          <Text style={styles.label}>Услуга</Text>
          <TextInput
            style={styles.input}
            value={service}
            onChangeText={setService}
            placeholder="Стрижка, укладка, окрашивание..."
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>Заметки</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Дополнительные заметки к визиту..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: spacing.sm,
  },
  title: {
    ...typography.h3,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  saveBtnText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 14,
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: spacing.xl,
    gap: spacing.xl,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    ...typography.bodySecondary,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  hint: {
    ...typography.caption,
    marginTop: 2,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    color: colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  clientSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedClient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  selectedClientName: {
    ...typography.body,
    fontWeight: '600',
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 15,
  },
  clientList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
    maxHeight: 250,
    overflow: 'hidden',
  },
  searchInput: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    color: colors.text,
    fontSize: 14,
  },
  clientScroll: {
    maxHeight: 200,
  },
  clientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  clientOptionName: {
    ...typography.body,
  },
  noResults: {
    ...typography.bodySecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
  timeRow: {
    gap: spacing.lg,
  },
  timeField: {
    gap: spacing.sm,
  },
  timePicker: {
    maxHeight: 44,
  },
  timeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeChipText: {
    color: colors.text,
    fontSize: 14,
  },
  timeChipTextActive: {
    color: colors.background,
    fontWeight: '700',
  },
});
