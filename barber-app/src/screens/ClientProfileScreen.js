import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
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
  const [showMemoryInput, setShowMemoryInput] = useState(false);

  const loadData = useCallback(async () => {
    const c = await getClient(clientId);
    setClient(c);
    const apts = await getAppointmentsByClient(clientId);
    setAppointments(apts);
    const mems = await getMemories(clientId);
    setMemories(mems);
  }, [clientId]);

  useFocusEffect(useCallback(() => {
    loadData();
  }, [loadData]));

  const handleAddMemory = async () => {
    if (!newMemory.trim()) return;
    await addMemory(clientId, newMemory.trim());
    setNewMemory('');
    setShowMemoryInput(false);
    loadData();
  };

  const handleDeleteMemory = (id) => {
    Alert.alert('Удалить заметку?', '', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => { await deleteMemory(id); loadData(); } },
    ]);
  };

  const handleDeleteClient = () => {
    Alert.alert('Удалить клиента?', 'Все данные клиента будут удалены навсегда', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          await deleteClient(clientId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (!client) return <View style={styles.container}><Text style={styles.loading}>Загрузка...</Text></View>;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('EditClient', { clientId })} style={styles.editBtn}>
            <Ionicons name="create-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Avatar name={client.name} color={client.avatar_color} size={72} />
          <Text style={styles.name}>{client.name}</Text>
          
          {/* Contact buttons */}
          <View style={styles.contactRow}>
            <ContactButton type="phone" value={client.phone} size={44} />
            <ContactButton type="whatsapp" value={client.whatsapp} size={44} />
            <ContactButton type="telegram" value={client.telegram} size={44} />
          </View>
        </View>

        {/* Haircut Description */}
        {client.haircut_description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cut-outline" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Причёска</Text>
            </View>
            <Text style={styles.sectionText}>{client.haircut_description}</Text>
          </View>
        )}

        {/* Preferences */}
        {client.preferences && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart-outline" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Пожелания</Text>
            </View>
            <Text style={styles.sectionText}>{client.preferences}</Text>
          </View>
        )}

        {/* Notes */}
        {client.notes && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Заметки</Text>
            </View>
            <Text style={styles.sectionText}>{client.notes}</Text>
          </View>
        )}

        {/* Memories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Воспоминания</Text>
            <TouchableOpacity onPress={() => setShowMemoryInput(!showMemoryInput)} style={styles.addMemoryBtn}>
              <Ionicons name="add-circle" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {showMemoryInput && (
            <View style={styles.memoryInputRow}>
              <TextInput
                style={styles.memoryInput}
                value={newMemory}
                onChangeText={setNewMemory}
                placeholder="Запишите воспоминание..."
                placeholderTextColor={colors.textMuted}
                multiline
              />
              <TouchableOpacity onPress={handleAddMemory} style={styles.memorySubmitBtn}>
                <Ionicons name="checkmark" size={20} color={colors.background} />
              </TouchableOpacity>
            </View>
          )}

          {memories.length === 0 && !showMemoryInput && (
            <Text style={styles.emptyText}>Нет воспоминаний. Нажмите + чтобы добавить</Text>
          )}

          {memories.map(mem => (
            <TouchableOpacity
              key={mem.id}
              style={styles.memoryCard}
              onLongPress={() => handleDeleteMemory(mem.id)}
            >
              <View style={styles.memoryContent}>
                <Text style={styles.memoryText}>{mem.content}</Text>
                <Text style={styles.memoryDate}>{formatDate(mem.date)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Visit History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>История визитов</Text>
            <Text style={styles.visitCount}>{appointments.length}</Text>
          </View>

          {appointments.slice(0, 10).map(apt => (
            <View key={apt.id} style={styles.visitCard}>
              <View style={styles.visitDate}>
                <Text style={styles.visitDateText}>{formatDate(apt.date)}</Text>
                <Text style={styles.visitTimeText}>{formatTime(apt.time_start)}</Text>
              </View>
              <View style={styles.visitInfo}>
                {apt.service && <Text style={styles.visitService}>{apt.service}</Text>}
                {apt.notes && <Text style={styles.visitNotes} numberOfLines={1}>{apt.notes}</Text>}
              </View>
              <View style={[styles.visitStatus, { 
                backgroundColor: apt.status === 'completed' ? colors.success + '22' : colors.primary + '22' 
              }]}>
                <Text style={[styles.visitStatusText, { 
                  color: apt.status === 'completed' ? colors.success : colors.primary 
                }]}>
                  {apt.status === 'completed' ? '✓' : '●'}
                </Text>
              </View>
            </View>
          ))}

          {appointments.length === 0 && (
            <Text style={styles.emptyText}>Ещё нет визитов</Text>
          )}
        </View>

        {/* Delete */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteClient}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
          <Text style={styles.deleteBtnText}>Удалить клиента</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { ...typography.body, textAlign: 'center', marginTop: 100 },
  content: { paddingBottom: 100 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingTop: 60, paddingBottom: spacing.md,
  },
  backBtn: { padding: spacing.sm },
  editBtn: { padding: spacing.sm },
  profileCard: {
    alignItems: 'center', paddingVertical: spacing.xxl,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    marginHorizontal: spacing.xl,
  },
  name: { ...typography.h1, marginTop: spacing.lg },
  contactRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  section: {
    marginHorizontal: spacing.xl, marginTop: spacing.xxl,
    backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  sectionTitle: { ...typography.h3, fontSize: 16, flex: 1 },
  sectionText: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  addMemoryBtn: { marginLeft: 'auto' },
  memoryInputRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  memoryInput: { flex: 1, backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, padding: spacing.md, color: colors.text, fontSize: 14 },
  memorySubmitBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  memoryCard: { backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm },
  memoryContent: {},
  memoryText: { ...typography.body, fontSize: 14 },
  memoryDate: { ...typography.caption, marginTop: spacing.xs },
  visitCount: { ...typography.caption, color: colors.primary, backgroundColor: colors.primaryFaded, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  visitCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  visitDate: { width: 60 },
  visitDateText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  visitTimeText: { ...typography.caption },
  visitInfo: { flex: 1, marginLeft: spacing.md },
  visitService: { ...typography.body, fontSize: 14 },
  visitNotes: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  visitStatus: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  visitStatusText: { fontSize: 12 },
  emptyText: { ...typography.bodySecondary, fontStyle: 'italic' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginHorizontal: spacing.xl, marginTop: spacing.xxl, padding: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.danger + '44' },
  deleteBtnText: { color: colors.danger, fontWeight: '600' },
});
