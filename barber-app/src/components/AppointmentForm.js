import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, fonts, typography } from '../theme/colors';
import { getAllClients } from '../database/db';
import { getTodayString, addDays, dayChipLabel, REMINDER_OPTIONS } from '../utils/contacts';
import Avatar from './Avatar';
import Field from './Field';

const TIME_SLOTS = [];
for (let h = 7; h <= 22; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

export default function AppointmentForm({ initial = {}, children, onChange }) {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(initial.client || null);
  const [date, setDate] = useState(initial.date || getTodayString());
  const [timeStart, setTimeStart] = useState(initial.time_start || '10:00');
  const [timeEnd, setTimeEnd] = useState(initial.time_end || '10:45');
  const [service, setService] = useState(initial.service || '');
  const [notes, setNotes] = useState(initial.notes || '');
  const [isWalkin, setIsWalkin] = useState(!!initial.is_walkin);
  const [walkinName, setWalkinName] = useState(initial.walkin_name || '');
  const [reminder, setReminder] = useState(initial.reminder_minutes ?? 60);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  const startRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => { (async () => setClients(await getAllClients()))(); }, []);

  // Expose state upward
  useEffect(() => {
    onChange?.({
      client_id: isWalkin ? null : selectedClient?.id || null,
      clientName: isWalkin ? walkinName : selectedClient?.name,
      date, time_start: timeStart, time_end: timeEnd,
      service, notes, is_walkin: isWalkin, walkin_name: walkinName,
      reminder_minutes: reminder,
    });
  }, [selectedClient, date, timeStart, timeEnd, service, notes, isWalkin, walkinName, reminder]);

  const filtered = clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()));

  const dayChips = [0, 1, 2, 3, 4, 5, 6].map(n => addDays(getTodayString(), n));

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Client type segmented */}
      <View style={styles.segment}>
        <SegBtn active={!isWalkin} label="Клиент из базы" icon="people" onPress={() => { Haptics.selectionAsync(); setIsWalkin(false); }} />
        <SegBtn active={isWalkin} label="Гость" icon="walk" onPress={() => { Haptics.selectionAsync(); setIsWalkin(true); }} />
      </View>

      {/* Client selection */}
      {isWalkin ? (
        <View style={styles.block}>
          <Field label="Имя гостя" icon="person" value={walkinName} onChangeText={setWalkinName} placeholder="Например, Гость" />
        </View>
      ) : (
        <View style={styles.block}>
          <Text style={styles.blockLabel}>Клиент</Text>
          <Pressable style={styles.selector} onPress={() => setPickerOpen(!pickerOpen)}>
            {selectedClient ? (
              <View style={styles.selRow}>
                <Avatar name={selectedClient.name} color={selectedClient.avatar_color} size={34} />
                <Text style={styles.selName}>{selectedClient.name}</Text>
              </View>
            ) : (
              <Text style={styles.placeholder}>Выберите клиента</Text>
            )}
            <Ionicons name={pickerOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
          </Pressable>

          {pickerOpen && (
            <View style={styles.pickerList}>
              <View style={styles.pickerSearch}>
                <Ionicons name="search" size={16} color={colors.textMuted} />
                <TextInput
                  style={styles.pickerSearchInput}
                  value={clientSearch}
                  onChangeText={setClientSearch}
                  placeholder="Поиск..."
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                {filtered.map(c => (
                  <Pressable key={c.id} style={styles.option} onPress={() => { Haptics.selectionAsync(); setSelectedClient(c); setPickerOpen(false); setClientSearch(''); }}>
                    <Avatar name={c.name} color={c.avatar_color} size={32} />
                    <Text style={styles.optionName}>{c.name}</Text>
                    {selectedClient?.id === c.id && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
                  </Pressable>
                ))}
                {filtered.length === 0 && <Text style={styles.noResults}>Никого не найдено</Text>}
              </ScrollView>
            </View>
          )}
        </View>
      )}

      {/* Date */}
      <View style={styles.block}>
        <Text style={styles.blockLabel}>Дата</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {dayChips.map(d => (
            <Chip key={d} active={date === d} label={dayChipLabel(d)} onPress={() => { Haptics.selectionAsync(); setDate(d); }} />
          ))}
        </ScrollView>
      </View>

      {/* Time */}
      <View style={styles.block}>
        <Text style={styles.blockLabel}>Начало</Text>
        <ScrollView ref={startRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {TIME_SLOTS.map(t => (
            <Chip key={`s${t}`} active={timeStart === t} label={t} compact onPress={() => { Haptics.selectionAsync(); setTimeStart(t); }} />
          ))}
        </ScrollView>
        <Text style={[styles.blockLabel, { marginTop: spacing.lg }]}>Конец</Text>
        <ScrollView ref={endRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {TIME_SLOTS.map(t => (
            <Chip key={`e${t}`} active={timeEnd === t} label={t} compact onPress={() => { Haptics.selectionAsync(); setTimeEnd(t); }} />
          ))}
        </ScrollView>
      </View>

      {/* Reminder */}
      <View style={styles.block}>
        <View style={styles.reminderHead}>
          <Ionicons name="notifications-outline" size={16} color={colors.primary} />
          <Text style={styles.blockLabel}>Напоминание</Text>
        </View>
        <View style={styles.reminderGrid}>
          {REMINDER_OPTIONS.map(opt => (
            <Chip key={opt.minutes} active={reminder === opt.minutes} label={opt.short} onPress={() => { Haptics.selectionAsync(); setReminder(opt.minutes); }} />
          ))}
        </View>
      </View>

      {/* Service & notes */}
      <View style={styles.block}>
        <Field label="Услуга" icon="cut" value={service} onChangeText={setService} placeholder="Стрижка, борода, укладка..." />
      </View>
      <View style={styles.block}>
        <Field label="Заметки" icon="document-text" iconColor={colors.info} value={notes} onChangeText={setNotes} placeholder="Детали визита" multiline />
      </View>

      {children}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function SegBtn({ active, label, icon, onPress }) {
  return (
    <Pressable style={[styles.segBtn, active && styles.segBtnActive]} onPress={onPress}>
      <Ionicons name={icon} size={16} color={active ? colors.textOnGold : colors.textSecondary} />
      <Text style={[styles.segText, active && styles.segTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Chip({ active, label, onPress, compact }) {
  return (
    <Pressable
      style={[styles.chip, compact && styles.chipCompact, active && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: 40, gap: spacing.lg },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
  },
  segBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: radius.full,
  },
  segBtnActive: { backgroundColor: colors.primary },
  segText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textSecondary },
  segTextActive: { color: colors.textOnGold },
  block: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  blockLabel: { ...typography.label, color: colors.textSecondary, letterSpacing: 0.8 },
  selector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surfaceLight, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
  },
  selRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  selName: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  placeholder: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 15 },
  pickerList: {
    backgroundColor: colors.surfaceLight, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, marginTop: spacing.sm, overflow: 'hidden',
  },
  pickerSearch: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  pickerSearchInput: { flex: 1, color: colors.text, fontFamily: fonts.medium, fontSize: 14 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  optionName: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  noResults: { ...typography.bodySecondary, textAlign: 'center', padding: spacing.lg, fontFamily: fonts.body },
  chipRow: { gap: spacing.sm, paddingRight: spacing.lg },
  chip: {
    paddingHorizontal: spacing.lg, paddingVertical: 10,
    backgroundColor: colors.surfaceLight, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border,
  },
  chipCompact: { paddingHorizontal: spacing.md },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textSecondary },
  chipTextActive: { color: colors.textOnGold },
  reminderHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reminderGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
});
