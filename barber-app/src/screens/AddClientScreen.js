import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
import { createClient } from '../database/db';

export default function AddClientScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [haircutDescription, setHaircutDescription] = useState('');
  const [preferences, setPreferences] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Введите имя клиента');
      return;
    }

    try {
      const id = await createClient({
        name: name.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        telegram: telegram.trim(),
        haircut_description: haircutDescription.trim(),
        preferences: preferences.trim(),
        notes: notes.trim(),
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось сохранить клиента');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Новый клиент</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Сохранить</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        {/* Basic Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Основное</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>Имя *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Имя клиента"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
          </View>
        </View>

        {/* Contacts */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Контакты</Text>
          
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Ionicons name="call" size={16} color={colors.phone} />
              <Text style={styles.label}>Телефон</Text>
            </View>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+7 999 123 45 67"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Ionicons name="logo-whatsapp" size={16} color={colors.whatsapp} />
              <Text style={styles.label}>WhatsApp</Text>
            </View>
            <TextInput
              style={styles.input}
              value={whatsapp}
              onChangeText={setWhatsapp}
              placeholder="79991234567 (без +)"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Ionicons name="paper-plane" size={16} color={colors.telegram} />
              <Text style={styles.label}>Telegram</Text>
            </View>
            <TextInput
              style={styles.input}
              value={telegram}
              onChangeText={setTelegram}
              placeholder="@username или номер"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* Hair & Preferences */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Причёска и пожелания</Text>
          
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Ionicons name="cut" size={16} color={colors.primary} />
              <Text style={styles.label}>Описание причёски</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={haircutDescription}
              onChangeText={setHaircutDescription}
              placeholder="Короткая стрижка, фейд на висках, объём сверху..."
              placeholderTextColor={colors.textMuted}
              multiline
            />
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Ionicons name="heart" size={16} color={colors.danger} />
              <Text style={styles.label}>Пожелания</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={preferences}
              onChangeText={setPreferences}
              placeholder="Любит разговаривать, предпочитает тишину, аллергия..."
              placeholderTextColor={colors.textMuted}
              multiline
            />
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Ionicons name="document-text" size={16} color={colors.info} />
              <Text style={styles.label}>Заметки</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Любые заметки о клиенте..."
              placeholderTextColor={colors.textMuted}
              multiline
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  sectionCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, gap: spacing.lg },
  sectionLabel: { ...typography.caption, color: colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  field: { gap: spacing.sm },
  label: { ...typography.bodySecondary, fontWeight: '600', color: colors.textSecondary },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: { backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, padding: spacing.lg, color: colors.text, fontSize: 15 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
});
