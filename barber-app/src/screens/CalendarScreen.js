import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, typography, fonts, gradients, shadows } from '../theme/colors';
import { getAppointmentsByDate, getAppointmentDates } from '../database/db';
import { getTodayString, formatTime, formatDateFull } from '../utils/contacts';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';

LocaleConfig.locales['ru'] = {
  monthNames: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
  monthNamesShort: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
  dayNames: ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],
  dayNamesShort: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
  today: 'Сегодня',
};
LocaleConfig.defaultLocale = 'ru';

const STATUS_COLOR = {
  scheduled: colors.primary,
  completed: colors.success,
  cancelled: colors.danger,
};

export default function CalendarScreen({ navigation, route }) {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [appointments, setAppointments] = useState([]);
  const [markedDates, setMarkedDates] = useState({});

  const loadAppointments = useCallback(async (date) => {
    setAppointments(await getAppointmentsByDate(date));
  }, []);

  const loadMarkedDates = useCallback(async (month, year) => {
    const dates = await getAppointmentDates(month, year);
    const marks = {};
    dates.forEach(d => { marks[d.date] = { marked: true, dotColor: colors.primary }; });
    setMarkedDates(marks);
  }, []);

  useFocusEffect(useCallback(() => {
    loadAppointments(selectedDate);
    const d = new Date(selectedDate);
    loadMarkedDates(d.getMonth() + 1, d.getFullYear());
  }, [selectedDate, loadAppointments, loadMarkedDates]));

  useEffect(() => {
    if (route?.params?.openAdd) {
      navigation.navigate('AddAppointment', { date: selectedDate });
      navigation.setParams({ openAdd: undefined });
    }
  }, [route?.params?.openAdd]);

  const onDayPress = (day) => {
    Haptics.selectionAsync();
    setSelectedDate(day.dateString);
  };

  const goAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('AddAppointment', { date: selectedDate });
  };

  const isToday = selectedDate === getTodayString();

  const renderAppointment = ({ item, index }) => {
    const color = STATUS_COLOR[item.status] || colors.primary;
    return (
      <Pressable
        style={({ pressed }) => [styles.aptRow, pressed && styles.pressed]}
        onPress={() => navigation.navigate('EditAppointment', { appointmentId: item.id })}
      >
        <View style={styles.timeCol}>
          <Text style={[styles.timeStart, { color }]}>{formatTime(item.time_start)}</Text>
          {item.time_end ? <Text style={styles.timeEnd}>{formatTime(item.time_end)}</Text> : null}
        </View>
        <View style={styles.track}>
          <View style={[styles.trackDot, { backgroundColor: color, borderColor: color + '40' }]} />
          {index < appointments.length - 1 && <View style={styles.trackLine} />}
        </View>
        <View style={[styles.card, item.status === 'completed' && styles.cardDone]}>
          <Avatar
            name={item.is_walkin ? item.walkin_name : item.client_name}
            color={item.avatar_color || colors.textMuted}
            size={44}
          />
          <View style={styles.cardInfo}>
            <Text style={[styles.cardName, item.status === 'cancelled' && styles.strike]} numberOfLines={1}>
              {item.is_walkin ? (item.walkin_name || 'Гость') : item.client_name}
            </Text>
            {item.service ? <Text style={styles.cardService} numberOfLines={1}>{item.service}</Text> : null}
            {item.is_walkin ? <Text style={styles.guestBadge}>гость</Text> : null}
          </View>
          {item.status === 'completed' && <Ionicons name="checkmark-circle" size={20} color={colors.success} />}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>РАСПИСАНИЕ</Text>
          <Text style={styles.title}>Календарь</Text>
        </View>
        <Pressable onPress={goAdd} style={({ pressed }) => [pressed && styles.pressed]}>
          <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.addBtn, shadows.gold]}>
            <Ionicons name="add" size={24} color={colors.textOnGold} />
          </LinearGradient>
        </Pressable>
      </View>

      <View style={styles.calendarCard}>
        <Calendar
          current={selectedDate}
          onDayPress={onDayPress}
          onMonthChange={(m) => loadMarkedDates(m.month, m.year)}
          markedDates={{
            ...markedDates,
            [selectedDate]: { ...markedDates[selectedDate], selected: true, selectedColor: colors.primary },
          }}
          firstDay={1}
          enableSwipeMonths
          theme={{
            calendarBackground: 'transparent',
            textSectionTitleColor: colors.textMuted,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: colors.textOnGold,
            todayTextColor: colors.primary,
            dayTextColor: colors.text,
            textDisabledColor: colors.textMuted,
            dotColor: colors.primary,
            selectedDotColor: colors.textOnGold,
            arrowColor: colors.primary,
            monthTextColor: colors.text,
            textDayFontFamily: fonts.medium,
            textMonthFontFamily: fonts.displayBold,
            textDayHeaderFontFamily: fonts.semibold,
            textDayFontSize: 15,
            textMonthFontSize: 19,
            textDayHeaderFontSize: 12,
          }}
        />
      </View>

      <View style={styles.dayHeader}>
        <View style={styles.dayHeaderLeft}>
          <Text style={styles.dayTitle}>{isToday ? 'Сегодня' : formatDateFull(selectedDate)}</Text>
          {isToday ? <Text style={styles.daySub}>{formatDateFull(selectedDate)}</Text> : null}
        </View>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{appointments.length}</Text>
        </View>
      </View>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAppointment}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="cafe-outline"
            title="Нет записей"
            subtitle="В этот день у вас пока нет записей."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingTop: 64,
    paddingBottom: spacing.lg,
  },
  eyebrow: { ...typography.label, color: colors.primary, marginBottom: 6 },
  title: { fontFamily: fonts.displayBold, fontSize: 32, color: colors.text },
  addBtn: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  calendarCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  dayHeaderLeft: {},
  dayTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.text, textTransform: 'capitalize' },
  daySub: { ...typography.caption, marginTop: 2, textTransform: 'capitalize' },
  countPill: {
    minWidth: 30, height: 30, borderRadius: 15, paddingHorizontal: 10,
    backgroundColor: colors.primaryFaded,
    borderWidth: 1, borderColor: colors.borderGold,
    alignItems: 'center', justifyContent: 'center',
  },
  countText: { fontFamily: fonts.heading, fontSize: 14, color: colors.primary },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: 120 },
  aptRow: { flexDirection: 'row' },
  timeCol: { width: 48, alignItems: 'flex-end', paddingRight: spacing.sm, paddingTop: 4 },
  timeStart: { fontFamily: fonts.heading, fontSize: 13 },
  timeEnd: { ...typography.caption, fontSize: 11, marginTop: 2 },
  track: { width: 22, alignItems: 'center' },
  trackDot: { width: 11, height: 11, borderRadius: 6, marginTop: 5, borderWidth: 3 },
  trackLine: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 2 },
  card: {
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
  cardDone: { opacity: 0.55 },
  cardInfo: { flex: 1 },
  cardName: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  strike: { textDecorationLine: 'line-through', color: colors.textMuted },
  cardService: { ...typography.caption, marginTop: 2 },
  guestBadge: {
    ...typography.caption, color: colors.primary, marginTop: 4,
    fontSize: 10, letterSpacing: 0.5,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
