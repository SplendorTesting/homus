import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
import { updateAppointment, deleteAppointment, getAllClients } from '../database/db';
import Avatar from '../components/Avatar';

const TIME_SLOTS = [];
for (let h = 8; h <= 21; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

export default function EditAppointmentScreen({ navigation, route }) {
  const { appointmentId, appointment: initialData } = route.params || {};
  
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [date, setDate] = useState('');
  const [timeStart, setTimeStart] = useState('10:00');
  const [timeEnd, setTimeEnd] = useState('11:00');
  const [service, setService] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('scheduled');
  const [isWalkin, setIsWalkin] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allClients = await getAllClients();
    setClients(allClients);

    // Load from database
    if (appointmentId) {
      const { getDatabase } = require('../database/db');
      const db = await getDatabase();
      const apt = await db.getFirstAsync('SELECT * FROM appointments WHERE id = ?', [appointmentId]);
      if (apt) {
        setDate(apt.date);
        setTimeStart(apt.time_start);
        setTimeEnd(apt.time_end || '');
        setService(apt.service || '');
        setNotes(apt.notes || '');
        setStatus(apt.status);
        setIsWalkin(!!apt.is_walkin);
        setWalkinName(apt.walkin_name || '');
        if (apt.client_id) {
          const client = allClients.find(c => c.id === apt.client_id);
          setSelectedClient(client || null);
        }
      }
    }
    setLoaded(true);
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const handleSave = async () => {
    try {
      await updateAppointment(appointmentId, {
        client_id: isWalkin ? null : selectedClient?.id || null,
        date,
        time_start: timeStart,
        time_end: timeEnd || null,
        service: service.trim() || null,
        notes: notes.trim() || null,
        status,
        is_walkin: isWalkin,
        walkin_name: isWalkin ? walkinName.trim() : null,
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось обновить запись');
    }
  };

  const handleDelete = () => {
    Alert.alert('Удалить запись?', 'Это действие нельзя отменить', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          await deleteAppointment(appointmentId);
          navigation.goBack();
        },
      },
    ]);
  };

  const statusOptions = [
    { key: 'scheduled', label: 'Запланировано', color: colors.primary },
    { key: 'completed', label: 'Завершено', color: colors.success },
    { key: 'cancelled', label: 'Отменено', color: colors.danger },
  ];

  if (!loaded) return <View style={styles.container}><Text style={styles.loading}>Загрузка...</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Редактировать</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Сохранить</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        {/* Status */}
        <View style={styles.field}>
          <Text style={styles.label}>Статус</Text>
          <View style={styles.statusRow}>
            {statusOptions.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.statusChip, status === opt.key && { backgroundColor: opt.color + '33', borderColor: opt.color }]}
                onPress={() => setStatus(opt.key)}
              >
                <View style={[styles.statusDot, { backgroundColor: opt.color }]} />
                <Text style={[styles.statusText, status === opt.key && { color: opt.color }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Walk-in toggle */}
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>Проходящий клиент</Text>
          </View>
          <Switch
            value={isWalkin}
            onValueChange={setIsWalkin}
            trackColor={{ false: colors.border, true: colors.primaryFaded }}
            thumbColor={isWalkin ? colors.primary : colors.textMuted}
          />
        </View>

        {/* Client */}
        {isWalkin ? (
          <View style={styles.field}>
            <Text style={styles.label}>Имя</Text>
            <TextInput style={styles.input} value={walkinName} onChangeText={setWalkinName} placeholderTextColor={colors.textMuted} placeholder="Имя клиента" />
          </View>
        ) : (
          <View style={styles.field}>
            <Text style={styles.label}>Клиент</Text>
            <TouchableOpacity style={styles.clientSelector} onPress={() => setShowClientPicker(!showClientPicker)}>
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
                <TextInput style={styles.searchInput} value={clientSearch} onChangeText={setClientSearch} placeholder="Поиск..." placeholderTextColor={colors.textMuted} />
                <ScrollView style={styles.clientScroll} nestedScrollEnabled>
                  {filteredClients.map(client => (
                    <TouchableOpacity key={client.id} style={styles.clientOption} onPress={() => { setSelectedClient(client); setShowClientPicker(false); }}>
                      <Avatar name={client.name} color={client.avatar_color} size={32} />
                      <Text style={styles.clientOptionName}>{client.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Date & Time */}
        <View style={styles.field}>
          <Text style={styles.label}>Дата</Text>
          <TextInput style={styles.input} value={date} onChangeText={setDate} placeholderTextColor={colors.textMuted} placeholder="ГГГГ-ММ-ДД" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Начало</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {TIME_SLOTS.map(t => (
              <TouchableOpacity key={t} style={[styles.timeChip, timeStart === t && styles.timeChipActive]} onPress={() => setTimeStart(t)}>
                <Text style={[styles.timeChipText, timeStart === t && styles.timeChipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Конец</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {TIME_SLOTS.map(t => (
              <TouchableOpacity key={t} style={[styles.timeChip, timeEnd === t && styles.timeChipActive]} onPress={() => setTimeEnd(t)}>
                <Text style={[styles.timeChipText, timeEnd === t && styles.timeChipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Услуга</Text>
          <TextInput style={styles.input} value={service} onChangeText={setService} placeholderTextColor={colors.textMuted} placeholder="Стрижка, укладка..." />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Заметки</Text>
          <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} placeholderTextColor={colors.textMuted} placeholder="Заметки..." multiline />
        </View>

        {/* Delete */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
          <Text style={styles.deleteBtnText}>Удалить запись</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { ...typography.body, textAlign: 'center', marginTop: 100 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingTop: 60, paddingBottom: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.sm },
  title: { ...typography.h3 },
  saveBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  saveBtnText: { color: colors.background, fontWeight: '700', fontSize: 14 },
  form: { flex: 1 },
  formContent: { padding: spacing.xl, gap: spacing.xl, paddingBottom: 100 },
  field: { gap: spacing.sm },
  label: { ...typography.bodySecondary, fontWeight: '600', color: colors.textSecondary },
  input: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.lg, color: colors.text, fontSize: 15, borderWidth: 1, borderColor: colors.border },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg },
  statusRow: { flexDirection: 'row', gap: spacing.sm },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { ...typography.caption, color: colors.textSecondary },
  clientSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  selectedClient: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  selectedClientName: { ...typography.body, fontWeight: '600' },
  placeholderText: { color: colors.textMuted, fontSize: 15 },
  clientList: { backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginTop: spacing.sm, maxHeight: 200 },
  searchInput: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, color: colors.text },
  clientScroll: { maxHeight: 150 },
  clientOption: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  clientOptionName: { ...typography.body },
  timeChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface, borderRadius: borderRadius.sm, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border },
  timeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  timeChipText: { color: colors.text, fontSize: 14 },
  timeChipTextActive: { color: colors.background, fontWeight: '700' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.danger + '44', marginTop: spacing.lg },
  deleteBtnText: { color: colors.danger, fontWeight: '600' },
});
