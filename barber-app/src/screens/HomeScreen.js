import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/colors';
import { getAppointmentsByDate, getTodayAppointmentsCount, getTotalClients } from '../database/db';
import { getTodayString, formatTime, formatDateFull } from '../utils/contacts';
import Avatar from '../components/Avatar';

export default function HomeScreen({ navigation }) {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [stats, setStats] = useState({ today: 0, total: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const today = getTodayString();
      const appointments = await getAppointmentsByDate(today);
      const todayCount = await getTodayAppointmentsCount();
      const totalClients = await getTotalClients();
      setTodayAppointments(appointments);
      setStats({ today: todayCount, total: totalClients });
    } catch (e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadData();
  }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const today = getTodayString();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Добрый день</Text>
            <Text style={styles.dateText}>{formatDateFull(today)}</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('Calendar', { screen: 'CalendarMain', params: { openAdd: true } })}
          >
            <Ionicons name="add" size={24} color={colors.background} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <Ionicons name="today-outline" size={24} color={colors.primary} />
            <Text style={styles.statNumber}>{stats.today}</Text>
            <Text style={styles.statLabel}>Сегодня</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={24} color={colors.info} />
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Клиентов</Text>
          </View>
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Расписание на сегодня</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
              <Text style={styles.seeAll}>Календарь</Text>
            </TouchableOpacity>
          </View>

          {todayAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>Записей на сегодня нет</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('Calendar', { screen: 'CalendarMain', params: { openAdd: true } })}
              >
                <Text style={styles.emptyButtonText}>Добавить запись</Text>
              </TouchableOpacity>
            </View>
          ) : (
            todayAppointments.map((apt) => (
              <TouchableOpacity
                key={apt.id}
                style={styles.appointmentCard}
                onPress={() => navigation.navigate('Calendar', { 
                  screen: 'EditAppointment', 
                  params: { appointmentId: apt.id } 
                })}
                activeOpacity={0.7}
              >
                <View style={styles.timeBlock}>
                  <Text style={styles.timeText}>{formatTime(apt.time_start)}</Text>
                  {apt.time_end && <Text style={styles.timeEndText}>{formatTime(apt.time_end)}</Text>}
                </View>
                <View style={styles.appointmentInfo}>
                  <View style={styles.appointmentRow}>
                    <Avatar
                      name={apt.is_walkin ? apt.walkin_name : apt.client_name}
                      color={apt.avatar_color || colors.textMuted}
                      size={36}
                    />
                    <View style={styles.appointmentDetails}>
                      <Text style={styles.clientName}>
                        {apt.is_walkin ? `${apt.walkin_name || 'Проходящий'}` : apt.client_name}
                      </Text>
                      {apt.service && <Text style={styles.serviceText}>{apt.service}</Text>}
                    </View>
                  </View>
                </View>
                <View style={[styles.statusDot, { 
                  backgroundColor: apt.status === 'completed' ? colors.success 
                    : apt.status === 'cancelled' ? colors.danger 
                    : colors.primary 
                }]} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  greeting: {
    ...typography.h1,
    color: colors.text,
  },
  dateText: {
    ...typography.bodySecondary,
    marginTop: spacing.xs,
    textTransform: 'capitalize',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.gold,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  statCardPrimary: {
    borderWidth: 1,
    borderColor: colors.primaryFaded,
  },
  statNumber: {
    ...typography.h1,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
  },
  seeAll: {
    ...typography.bodySecondary,
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
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
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  timeBlock: {
    width: 55,
    marginRight: spacing.md,
  },
  timeText: {
    ...typography.h3,
    color: colors.primary,
    fontSize: 16,
  },
  timeEndText: {
    ...typography.caption,
    marginTop: 2,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  appointmentDetails: {
    flex: 1,
  },
  clientName: {
    ...typography.body,
    fontWeight: '600',
  },
  serviceText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: spacing.sm,
  },
});
