import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { colors, spacing, radius, fonts, typography } from '../theme/colors';
import { createClient } from '../database/db';
import Header from '../components/Header';
import Field from '../components/Field';
import Button from '../components/Button';

export default function AddClientScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [haircut, setHaircut] = useState('');
  const [preferences, setPreferences] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Введите имя', 'Имя клиента обязательно для сохранения');
      return;
    }
    try {
      await createClient({
        name: name.trim(), phone: phone.trim(), whatsapp: whatsapp.trim(), telegram: telegram.trim(),
        haircut_description: haircut.trim(), preferences: preferences.trim(), notes: notes.trim(),
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось сохранить клиента');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Новый клиент" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Основное</Text>
            <Field label="Имя" value={name} onChangeText={setName} placeholder="Например, Александр" autoFocus />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Контакты</Text>
            <Field label="Телефон" icon="call" iconColor={colors.phone} value={phone} onChangeText={setPhone} placeholder="+7 999 123 45 67" keyboardType="phone-pad" />
            <Field label="WhatsApp" icon="logo-whatsapp" iconColor={colors.whatsapp} value={whatsapp} onChangeText={setWhatsapp} placeholder="79991234567" keyboardType="phone-pad" />
            <Field label="Telegram" icon="paper-plane" iconColor={colors.telegram} value={telegram} onChangeText={setTelegram} placeholder="@username" />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Причёска и пожелания</Text>
            <Field label="Описание причёски" icon="cut" value={haircut} onChangeText={setHaircut} placeholder="Фейд по бокам, объём сверху, ножницы..." multiline />
            <Field label="Пожелания" icon="heart" iconColor={colors.danger} value={preferences} onChangeText={setPreferences} placeholder="Любит тишину, кофе без сахара, аллергия на..." multiline />
            <Field label="Заметки" icon="document-text" iconColor={colors.info} value={notes} onChangeText={setNotes} placeholder="Любая дополнительная информация" multiline />
          </View>

          <Button title="Сохранить клиента" icon="checkmark" onPress={handleSave} fullWidth size="lg" style={{ marginTop: spacing.sm }} />
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingBottom: 40, gap: spacing.xl },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  sectionLabel: { fontFamily: fonts.displayBold, fontSize: 17, color: colors.text },
});
