import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/colors';
import { getAllClients, searchClients } from '../database/db';
import Avatar from '../components/Avatar';
import ContactButton from '../components/ContactButton';

export default function ClientsScreen({ navigation }) {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');

  const loadClients = useCallback(async () => {
    const data = search.trim() ? await searchClients(search.trim()) : await getAllClients();
    setClients(data);
  }, [search]);

  useFocusEffect(useCallback(() => {
    loadClients();
  }, [loadClients]));

  const renderClient = ({ item }) => (
    <TouchableOpacity
      style={styles.clientCard}
      onPress={() => navigation.navigate('ClientProfile', { clientId: item.id })}
      activeOpacity={0.7}
    >
      <Avatar name={item.name} color={item.avatar_color} size={50} />
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.name}</Text>
        {item.haircut_description && (
          <Text style={styles.clientDesc} numberOfLines={1}>{item.haircut_description}</Text>
        )}
        <View style={styles.contactRow}>
          <ContactButton type="phone" value={item.phone} size={30} />
          <ContactButton type="whatsapp" value={item.whatsapp} size={30} />
          <ContactButton type="telegram" value={item.telegram} size={30} />
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Клиенты</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddClient')}
        >
          <Ionicons name="person-add" size={20} color={colors.background} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Поиск клиентов..."
          placeholderTextColor={colors.textMuted}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={clients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderClient}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>
              {search ? 'Никого не найдено' : 'Добавьте первого клиента'}
            </Text>
            {!search && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('AddClient')}
              >
                <Text style={styles.emptyButtonText}>Добавить клиента</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
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
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.gold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xl,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    height: 48,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  clientInfo: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  clientName: {
    ...typography.body,
    fontWeight: '600',
  },
  clientDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  contactRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  emptyText: {
    ...typography.bodySecondary,
    marginTop: spacing.md,
  },
  emptyButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primaryFaded,
    borderRadius: borderRadius.md,
  },
  emptyButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
