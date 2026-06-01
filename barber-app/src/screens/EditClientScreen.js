import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { colors, spacing, radius, fonts } from '../theme/colors';
import { getClient, updateClient } from '../database/db';
import Header from '../components/Header';
import Field from '../components/Field';
import Button from '../components/Button';

export default function EditClientScreen({ navigation, route }) {
  const { clientId } = route.params;
  const [form, setForm] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const c = await getClient(clientId);
    setForm({
      name: c?.name || '', phone: c?.phone || '', whatsapp: c?.whatsapp || '',
      telegram: c?.telegram || '', haircut: c?.haircut_description || '',
      preferences: c?.preferences || '', notes: c?.notes || '',
    });
  };

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Введите имя'); return; }
    await updateClient(clientId, {
      name: form.name.trim(), phone: form.phone.trim(), whatsapp: form.whatsapp.trim(),
      telegram: form.telegram.trim(), haircut_description: form.haircut.trim(),
      preferences: form.preferences.trim(), notes: form.notes.trim(),
    });
    navigation.goBack();
  };

  if (!form) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <Header title="Редактировать" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Основное</Text>
            <Field label="Имя" value={form.name} onChangeText={set('name')} />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Контакты</Text>
            <Field label="Телефон" icon="call" iconColor={colors.phone} value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
            <Field label="WhatsApp" icon="logo-whatsapp" iconColor={colors.whatsapp} value={form.whatsapp} onChangeText={set('whatsapp')} keyboardType="phone-pad" />
            <Field label="Telegram" icon="paper-plane" iconColor={colors.telegram} value={form.telegram} onChangeText={set('telegram')} />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Причёска и пожелания</Text>
            <Field label="Описание причёски" icon="cut" value={form.haircut} onChangeText={set('haircut')} multiline />
            <Field label="Пожелания" icon="heart" iconColor={colors.danger} value={form.preferences} onChangeText={set('preferences')} multiline />
            <Field label="Заметки" icon="document-text" iconColor={colors.info} value={form.notes} onChangeText={set('notes')} multiline />
          </View>
          <Button title="Сохранить изменения" icon="checkmark" onPress={handleSave} fullWidth size="lg" />
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: spacing.xl, paddingBottom: 40, gap: spacing.xl },
  section: {
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.border, padding: spacing.lg, gap: spacing.lg,
  },
  sectionLabel: { fontFamily: fonts.displayBold, fontSize: 17, color: colors.text },
});
