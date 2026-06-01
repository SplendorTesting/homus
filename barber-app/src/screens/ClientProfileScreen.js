import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, typography, fonts, gradients } from '../theme/colors';
import { getClient, getAppointmentsByClient, getMemories, addMemory, deleteMemory, deleteClient } from '../database/db';
import { formatDate, formatTime } from '../utils/contacts';
import Avatar from '../components/Avatar';
import ContactButton from '../components/ContactButton';

export default function ClientProfileScreen({ navigation, route }) {
  const { clientId } = route.params;
  const [client, setClient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [memories, setMemories] = useState([]);
  const [newMemory, setNewMemory] = useState('');
  const [showInput, setShowInput] = useState(false);

  const loadData = useCallback(async () => {
    setClient(await getClient(clientId));
    setAppointments(await getAppointmentsByClient(clientId));
    setMemories(await getMemories(clientId));
  }, [clientId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleAddMemory = async () => {
    if (!newMemory.trim()) return;
    await addMemory(clientId, newMemory.trim());
    setNewMemory('');
    setShowInput(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    loadData();
  };

  const handleDeleteMemory = (id) => {
    Alert.alert('Удалить воспоминание?', '', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => { await deleteMemory(id); loadData(); } },
    ]);
  };

  const handleDeleteClient = () => {
    Alert.alert('Удалить клиента?', 'Все данные, записи и воспоминания будут удалены навсегда.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => { await deleteClient(clientId); navigation.goBack(); } },
    ]);
  };

  if (!client) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  const visitCount = appointments.length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={gradients.hero} style={styles.hero}>
          <View style={styles.heroNav}>
            <Pressable onPress={() => navigation.goBack()} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </Pressable>
            <Pressable onPress={() => navigation.navigate('EditClient', { clientId })} style={styles.navBtn}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </Pressable>
          </View>

          <View style={styles.heroBody}>
            <Avatar name={client.name} color={client.avatar_color} size={88} ring />
            <Text style={styles.name}>{client.name}</Text>

            <View style={styles.miniStats}>
              <View style={styles.miniStat}>
                <Text style={styles.miniValue}>{visitCount}</Text>
                <Text style={styles.miniLabel}>визитов</Text>
              </View>
              <View style={styles.miniDivider} />
              <View style={styles.miniStat}>
                <Text style={styles.miniValue}>{completedCount}</Text>
                <Text style={styles.miniLabel}>завершено</Text>
              </View>
              <View style={styles.miniDivider} />
              <View style={styles.miniStat}>
                <Text style={styles.miniValue}>{memories.length}</Text>
                <Text style={styles.miniLabel}>заметок</Text>
              </View>
            </View>

            {(client.phone || client.whatsapp || client.telegram) ? (
              <View style={styles.contactRow}>
                <ContactButton type="phone" value={client.phone} size={48} />
                <ContactButton type="whatsapp" value={client.whatsapp} size={48} />
                <ContactButton type="telegram" value={client.telegram} size={48} />
              </View>
            ) : null}
          </View>
        </LinearGradient>

        <View style={styles.bodyPad}>
          {client.haircut_description ? (
            <InfoCard icon="cut" title="Причёска" text={client.haircut_description} />
          ) : null}
          {client.preferences ? (
            <InfoCard icon="heart" iconColor={colors.danger} title="Пожелания" text={client.preferences} />
          ) : null}
          {client.notes ? (
            <InfoCard icon="document-text" iconColor={colors.info} title="Заметки" text={client.notes} />
          ) : null}

          {/* Memories */}
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Ionicons name="bulb-outline" size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>Воспоминания</Text>
              <Pressable onPress={() => setShowInput(!showInput)} style={styles.addInline}>
                <Ionicons name={showInput ? 'remove-circle' : 'add-circle'} size={24} color={colors.primary} />
              </Pressable>
            </View>

            {showInput && (
              <View style={styles.memoryInputRow}>
                <TextInput
                  style={styles.memoryInput}
                  value={newMemory}
                  onChangeText={setNewMemory}
                  placeholder="Что важно запомнить об этом визите?"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  autoFocus
                />
                <Pressable onPress={handleAddMemory} style={styles.memorySend}>
                  <Ionicons name="arrow-up" size={18} color={colors.textOnGold} />
                </Pressable>
              </View>
            )}

            {memories.length === 0 && !showInput ? (
              <Text style={styles.emptyMini}>Нажмите +, чтобы добавить воспоминание</Text>
            ) : null}

            {memories.map(mem => (
              <Pressable key={mem.id} style={styles.memoryCard} onLongPress={() => handleDeleteMemory(mem.id)}>
                <View style={styles.memoryQuote} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.memoryText}>{mem.content}</Text>
                  <Text style={styles.memoryDate}>{formatDate(mem.date)}</Text>
                </View>
              </Pressable>
            ))}
            {memories.length > 0 ? <Text style={styles.hint}>Удерживайте заметку, чтобы удалить</Text> : null}
          </View>

          {/* History */}
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Ionicons name="time-outline" size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>История визитов</Text>
            </View>
            {appointments.length === 0 ? (
              <Text style={styles.emptyMini}>Визитов пока не было</Text>
            ) : (
              appointments.slice(0, 12).map(apt => (
                <View key={apt.id} style={styles.visitRow}>
                  <View style={styles.visitDate}>
                    <Text style={styles.visitDateText}>{formatDate(apt.date)}</Text>
                    <Text style={styles.visitTime}>{formatTime(apt.time_start)}</Text>
                  </View>
                  <View style={styles.visitInfo}>
                    <Text style={styles.visitService} numberOfLines={1}>{apt.service || 'Визит'}</Text>
                    {apt.notes ? <Text style={styles.visitNotes} numberOfLines={1}>{apt.notes}</Text> : null}
                  </View>
                  <View style={[styles.visitStatus, {
                    backgroundColor: apt.status === 'completed' ? colors.success + '22' : apt.status === 'cancelled' ? colors.danger + '22' : colors.primaryFaded,
                  }]}>
                    <Ionicons
                      name={apt.status === 'completed' ? 'checkmark' : apt.status === 'cancelled' ? 'close' : 'ellipse'}
                      size={apt.status === 'scheduled' ? 8 : 14}
                      color={apt.status === 'completed' ? colors.success : apt.status === 'cancelled' ? colors.danger : colors.primary}
                    />
                  </View>
                </View>
              ))
            )}
          </View>

          <Pressable style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]} onPress={handleDeleteClient}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text style={styles.deleteText}>Удалить клиента</Text>
          </Pressable>
          <View style={{ height: 110 }} />
        </View>
      </ScrollView>
    </View>
  );
}

function InfoCard({ icon, iconColor = colors.primary, title, text }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Ionicons name={`${icon}-outline`} size={18} color={iconColor} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: 20 },
  hero: {
    paddingTop: 56,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  heroNav: { flexDirection: 'row', justifyContent: 'space-between' },
  navBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  heroBody: { alignItems: 'center', marginTop: spacing.md },
  name: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.text, marginTop: spacing.lg, textAlign: 'center' },
  miniStats: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: spacing.lg, marginBottom: spacing.xl,
  },
  miniStat: { alignItems: 'center', paddingHorizontal: spacing.xl },
  miniValue: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.primary },
  miniLabel: { ...typography.caption, marginTop: 2 },
  miniDivider: { width: 1, height: 28, backgroundColor: colors.border },
  contactRow: { flexDirection: 'row', gap: spacing.lg },
  bodyPad: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  cardTitle: { fontFamily: fonts.heading, fontSize: 16, color: colors.text, flex: 1 },
  cardText: { ...typography.bodyRegular, color: colors.textSecondary, lineHeight: 23 },
  addInline: {},
  memoryInputRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, alignItems: 'flex-end' },
  memoryInput: {
    flex: 1, backgroundColor: colors.surfaceLight, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, color: colors.text, fontFamily: fonts.body, fontSize: 14, maxHeight: 120,
  },
  memorySend: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  memoryCard: {
    flexDirection: 'row', gap: spacing.md,
    backgroundColor: colors.surfaceLight, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  memoryQuote: { width: 3, borderRadius: 2, backgroundColor: colors.primary },
  memoryText: { ...typography.bodyRegular, fontSize: 14, lineHeight: 20 },
  memoryDate: { ...typography.caption, marginTop: 6 },
  emptyMini: { ...typography.bodySecondary, fontStyle: 'italic', fontFamily: fonts.body },
  hint: { ...typography.caption, textAlign: 'center', marginTop: spacing.xs },
  visitRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
  },
  visitDate: { width: 60 },
  visitDateText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.primary },
  visitTime: { ...typography.caption, marginTop: 2 },
  visitInfo: { flex: 1, marginLeft: spacing.md },
  visitService: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  visitNotes: { ...typography.caption, marginTop: 2 },
  visitStatus: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    padding: spacing.lg, borderRadius: radius.full,
    borderWidth: 1, borderColor: 'rgba(217,113,107,0.3)',
    marginTop: spacing.sm,
  },
  deleteText: { color: colors.danger, fontFamily: fonts.semibold, fontSize: 14 },
});
