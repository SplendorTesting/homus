import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, typography, fonts, gradients, shadows } from '../theme/colors';
import { getAppointmentsByDate, getTodayAppointmentsCount, getTotalClients } from '../database/db';
import { getTodayString, formatTime, formatDateFull } from '../utils/contacts';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return 'Доброй ночи';
  if (h < 12) return 'Доброе утро';
  if (h < 18) return 'Добрый день';
  return 'Добрый вечер';
}

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

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const today = getTodayString();
  const nextApt = todayAppointments.find(a => a.status === 'scheduled');
  const completed = todayAppointments.filter(a => a.status === 'completed').length;

  const goAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Calendar', { screen: 'AddAppointment', params: { date: today } });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Hero */}
        <LinearGradient colors={gradients.hero} style={styles.hero}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.brandRow}>
                <Text style={styles.brand}>Trimmer</Text>
              </Text>
              <Text style={styles.greeting}>{greeting()}</Text>
            </View>
            <View style={styles.logoBadge}>
              <MaterialCommunityIcons name="content-cut" size={20} color={colors.primary} />
            </View>
          </View>

          <Text style={styles.dateText}>{formatDateFull(today)}</Text>

          {/* Next appointment highlight */}
          {nextApt ? (
            <Pressable
              style={({ pressed }) => [styles.nextCard, pressed && styles.pressed]}
              onPress={() => navigation.navigate('Calendar', { screen: 'EditAppointment', params: { appointmentId: nextApt.id } })}
            >
              <View style={styles.nextLeft}>
                <Text style={styles.nextLabel}>СЛЕДУЮЩАЯ ЗАПИСЬ</Text>
                <Text style={styles.nextName}>
                  {nextApt.is_walkin ? (nextApt.walkin_name || 'Гость') : nextApt.client_name}
                </Text>
                {nextApt.service ? <Text style={styles.nextService}>{nextApt.service}</Text> : null}
              </View>
              <View style={styles.nextTime}>
                <Text style={styles.nextTimeText}>{formatTime(nextApt.time_start)}</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </View>
            </Pressable>
          ) : (
            <View style={styles.nextCardEmpty}>
              <Ionicons name="checkmark-done-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.nextEmptyText}>На сегодня записей больше нет</Text>
            </View>
          )}
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard icon="today-outline" value={stats.today} label="Сегодня" tint={colors.primary} />
          <StatCard icon="checkmark-circle-outline" value={completed} label="Завершено" tint={colors.success} />
          <StatCard icon="people-outline" value={stats.total} label="Клиентов" tint={colors.info} />
        </View>

        {/* Quick actions */}
        <View style={styles.actionsRow}>
          <QuickAction icon="add-circle" label="Новая запись" onPress={goAdd} primary />
          <QuickAction icon="person-add-outline" label="Клиент" onPress={() => navigation.navigate('Clients', { screen: 'AddClient' })} />
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Сегодня</Text>
            <Pressable onPress={() => navigation.navigate('Calendar')}>
              <Text style={styles.seeAll}>Календарь</Text>
            </Pressable>
          </View>

          {todayAppointments.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title="Свободный день"
              subtitle="Записей на сегодня пока нет. Добавьте первую запись."
            />
          ) : (
            todayAppointments.map((apt, idx) => (
              <Pressable
                key={apt.id}
                style={({ pressed }) => [styles.aptRow, pressed && styles.pressed]}
                onPress={() => navigation.navigate('Calendar', { screen: 'EditAppointment', params: { appointmentId: apt.id } })}
              >
                <View style={styles.timeCol}>
                  <Text style={[styles.timeText, apt.status === 'completed' && styles.timeDone]}>
                    {formatTime(apt.time_start)}
                  </Text>
                  <View style={styles.timeTrack}>
                    <View style={[styles.timeDot, {
                      backgroundColor: apt.status === 'completed' ? colors.success
                        : apt.status === 'cancelled' ? colors.danger : colors.primary,
                    }]} />
                    {idx < todayAppointments.length - 1 && <View style={styles.timeLine} />}
                  </View>
                </View>
                <View style={[styles.aptCard, apt.status === 'completed' && styles.aptCardDone]}>
                  <Avatar
                    name={apt.is_walkin ? apt.walkin_name : apt.client_name}
                    color={apt.avatar_color || colors.textMuted}
                    size={42}
                  />
                  <View style={styles.aptInfo}>
                    <Text style={[styles.aptName, apt.status === 'cancelled' && styles.strike]} numberOfLines={1}>
                      {apt.is_walkin ? (apt.walkin_name || 'Гость') : apt.client_name}
                      {apt.is_walkin ? <Text style={styles.guestTag}>  гость</Text> : null}
                    </Text>
                    {apt.service ? <Text style={styles.aptService} numberOfLines={1}>{apt.service}</Text> : null}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </View>
              </Pressable>
            ))
          )}
        </View>
        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, value, label, tint }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: tint + '1A' }]}>
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, onPress, primary }) {
  const handle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };
  if (primary) {
    return (
      <Pressable style={({ pressed }) => [styles.actionWrap, pressed && styles.pressed]} onPress={handle}>
        <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.action, shadows.gold]}>
          <Ionicons name={icon} size={20} color={colors.textOnGold} />
          <Text style={[styles.actionLabel, { color: colors.textOnGold }]}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable style={({ pressed }) => [styles.actionWrap, pressed && styles.pressed]} onPress={handle}>
      <View style={[styles.action, styles.actionSecondary]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={[styles.actionLabel, { color: colors.text }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 20 },
  hero: {
    paddingTop: 64,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brand: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.text, letterSpacing: 0.5 },
  greeting: { ...typography.bodySecondary, marginTop: 4 },
  logoBadge: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primaryFaded,
    borderWidth: 1, borderColor: colors.borderGold,
    alignItems: 'center', justifyContent: 'center',
  },
  dateText: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  nextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(200,168,100,0.08)',
    borderWidth: 1,
    borderColor: colors.borderGold,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  nextLeft: { flex: 1 },
  nextLabel: { ...typography.label, color: colors.primary, marginBottom: 6 },
  nextName: { fontFamily: fonts.heading, fontSize: 18, color: colors.text },
  nextService: { ...typography.bodySecondary, marginTop: 2 },
  nextTime: { alignItems: 'flex-end', gap: 4 },
  nextTimeText: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.primary },
  nextCardEmpty: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  nextEmptyText: { ...typography.bodySecondary },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'flex-start',
  },
  statIcon: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  statValue: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.text },
  statLabel: { ...typography.caption, marginTop: 2 },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  actionWrap: { flex: 1 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 16,
    borderRadius: radius.full,
  },
  actionSecondary: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  actionLabel: { fontFamily: fonts.heading, fontSize: 14 },
  section: { marginTop: spacing.xxl, paddingHorizontal: spacing.xl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.text },
  seeAll: { ...typography.body, color: colors.primary, fontFamily: fonts.semibold },
  aptRow: { flexDirection: 'row', marginBottom: spacing.xs },
  timeCol: { width: 54, alignItems: 'center' },
  timeText: { fontFamily: fonts.heading, fontSize: 14, color: colors.primary, marginBottom: 6 },
  timeDone: { color: colors.success },
  timeTrack: { flex: 1, alignItems: 'center' },
  timeDot: { width: 9, height: 9, borderRadius: 5, marginTop: 2 },
  timeLine: { width: 2, flex: 1, backgroundColor: colors.border, marginTop: 2 },
  aptCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  aptCardDone: { opacity: 0.6 },
  aptInfo: { flex: 1 },
  aptName: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  guestTag: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  strike: { textDecorationLine: 'line-through', color: colors.textMuted },
  aptService: { ...typography.caption, marginTop: 2 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
