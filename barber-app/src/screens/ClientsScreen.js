import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, typography, fonts, gradients, shadows } from '../theme/colors';
import { getAllClients, searchClients } from '../database/db';
import Avatar from '../components/Avatar';
import ContactButton from '../components/ContactButton';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';

export default function ClientsScreen({ navigation }) {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');

  const loadClients = useCallback(async () => {
    const data = search.trim() ? await searchClients(search.trim()) : await getAllClients();
    setClients(data);
  }, [search]);

  useFocusEffect(useCallback(() => { loadClients(); }, [loadClients]));

  const renderClient = ({ item }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => navigation.navigate('ClientProfile', { clientId: item.id })}
    >
      <Avatar name={item.name} color={item.avatar_color} size={52} ring />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        {item.haircut_description ? (
          <Text style={styles.desc} numberOfLines={1}>{item.haircut_description}</Text>
        ) : (
          <Text style={styles.descMuted}>Профиль клиента</Text>
        )}
      </View>
      <View style={styles.contactRow}>
        <ContactButton type="phone" value={item.phone} size={34} />
        <ContactButton type="whatsapp" value={item.whatsapp} size={34} />
        <ContactButton type="telegram" value={item.telegram} size={34} />
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Header
        eyebrow={`${clients.length} ${plural(clients.length)}`}
        title="Клиенты"
        right={
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); navigation.navigate('AddClient'); }}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.addBtn, shadows.gold]}>
              <Ionicons name="add" size={24} color={colors.textOnGold} />
            </LinearGradient>
          </Pressable>
        }
      />

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Поиск по имени или телефону"
          placeholderTextColor={colors.textMuted}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      <FlatList
        data={clients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderClient}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title={search ? 'Ничего не найдено' : 'Пока нет клиентов'}
            subtitle={search ? 'Попробуйте изменить запрос' : 'Создайте первую карточку клиента — с контактами, причёской и пожеланиями.'}
            action={!search ? <Button title="Добавить клиента" icon="person-add" onPress={() => navigation.navigate('AddClient')} /> : null}
          />
        }
      />
    </View>
  );
}

function plural(n) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'клиент';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'клиента';
  return 'клиентов';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  addBtn: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    height: 50,
  },
  searchInput: { flex: 1, color: colors.text, fontFamily: fonts.medium, fontSize: 15 },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: 110 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    paddingRight: spacing.lg,
    marginBottom: spacing.md,
  },
  info: { flex: 1, marginLeft: spacing.lg, marginRight: spacing.sm },
  name: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  desc: { ...typography.bodySecondary, marginTop: 3 },
  descMuted: { ...typography.caption, marginTop: 3 },
  contactRow: { flexDirection: 'row', gap: spacing.xs },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
