import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
import { getClient, updateClient } from '../database/db';

export default function EditClientScreen({ navigation, route }) {
  const { clientId } = route.params;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [haircutDescription, setHaircutDescription] = useState('');
  const [preferences, setPreferences] = useState('');
  const [notes, setNotes] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadClient();
  }, []);

  const loadClient = async () => {
    const c = await getClient(clientId);
    if (c) {
      setName(c.name || '');
      setPhone(c.phone || '');
      setWhatsapp(c.whatsapp || '');
      setTelegram(c.telegram || '');
      setHaircutDescription(c.haircut_description || '');
      setPreferences(c.preferences || '');
      setNotes(c.notes || '');
    }
    setLoaded(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Введите имя клиента');
      return;
    }

    try {
      await updateClient(clientId, {
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
      Alert.alert('Ошибка', 'Не удалось обновить клиента');
    }
  };

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
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Основное</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Имя *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={colors.textMuted} />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Контакты</Text>
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Ionicons name="call" size={16} color={colors.phone} />
              <Text style={styles.label}>Телефон</Text>
            </View>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={colors.textMuted} />
          </View>
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Ionicons name="logo-whatsapp" size={16} color={colors.whatsapp} />
              <Text style={styles.label}>WhatsApp</Text>
            </View>
            <TextInput style={styles.input} value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" placeholderTextColor={colors.textMuted} />
          </View>
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Ionicons name="paper-plane" size={16} color={colors.telegram} />
              <Text style={styles.label}>Telegram</Text>
            </View>
            <TextInput style={styles.input} value={telegram} onChangeText={setTelegram} placeholderTextColor={colors.textMuted} />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Причёска и пожелания</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Описание причёски</Text>
            <TextInput style={[styles.input, styles.textArea]} value={haircutDescription} onChangeText={setHaircutDescription} multiline placeholderTextColor={colors.textMuted} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Пожелания</Text>
            <TextInput style={[styles.input, styles.textArea]} value={preferences} onChangeText={setPreferences} multiline placeholderTextColor={colors.textMuted} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Заметки</Text>
            <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} multiline placeholderTextColor={colors.textMuted} />
          </View>
        </View>
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
  sectionCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, gap: spacing.lg },
  sectionLabel: { ...typography.caption, color: colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  field: { gap: spacing.sm },
  label: { ...typography.bodySecondary, fontWeight: '600', color: colors.textSecondary },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: { backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, padding: spacing.lg, color: colors.text, fontSize: 15 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
});
