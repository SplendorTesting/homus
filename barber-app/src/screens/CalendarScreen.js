import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/colors';
import { getAppointmentsByDate, getAppointmentDates } from '../database/db';
import { getTodayString, formatTime, formatDateFull } from '../utils/contacts';
import Avatar from '../components/Avatar';

// Configure Russian locale
LocaleConfig.locales['ru'] = {
  monthNames: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
  monthNamesShort: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
  dayNames: ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],
  dayNamesShort: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
  today: 'Сегодня',
};
LocaleConfig.defaultLocale = 'ru';

export default function CalendarScreen({ navigation, route }) {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [appointments, setAppointments] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const loadAppointments = useCallback(async (date) => {
    const data = await getAppointmentsByDate(date);
    setAppointments(data);
  }, []);

  const loadMarkedDates = useCallback(async (month, year) => {
    const dates = await getAppointmentDates(month, year);
    const marks = {};
    dates.forEach(d => {
      marks[d.date] = {
        marked: true,
        dotColor: colors.primary,
      };
    });
    // Add selected date marking
    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: colors.primary,
    };
    setMarkedDates(marks);
  }, [selectedDate]);

  useFocusEffect(useCallback(() => {
    loadAppointments(selectedDate);
    const date = new Date(selectedDate);
    loadMarkedDates(date.getMonth() + 1, date.getFullYear());
  }, [selectedDate, loadAppointments, loadMarkedDates]));

  useEffect(() => {
    if (route?.params?.openAdd) {
      navigation.navigate('AddAppointment', { date: selectedDate });
      navigation.setParams({ openAdd: undefined });
    }
  }, [route?.params?.openAdd]);

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const onMonthChange = (month) => {
    setCurrentMonth(new Date(month.dateString));
    loadMarkedDates(month.month, month.year);
  };

  const renderAppointment = ({ item }) => (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={() => navigation.navigate('EditAppointment', { appointmentId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.timeStrip}>
        <View style={[styles.timeStripLine, { backgroundColor: item.status === 'completed' ? colors.success : colors.primary }]} />
      </View>
      <View style={styles.timeColumn}>
        <Text style={styles.timeStart}>{formatTime(item.time_start)}</Text>
        {item.time_end && <Text style={styles.timeEnd}>{formatTime(item.time_end)}</Text>}
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardRow}>
          <Avatar
            name={item.is_walkin ? item.walkin_name : item.client_name}
            color={item.avatar_color || colors.textMuted}
            size={40}
          />
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>
              {item.is_walkin ? (item.walkin_name || 'Проходящий клиент') : item.client_name}
              {item.is_walkin && <Text style={styles.walkinBadge}> (прохожий)</Text>}
            </Text>
            {item.service && <Text style={styles.cardService}>{item.service}</Text>}
            {item.notes && <Text style={styles.cardNotes} numberOfLines={1}>{item.notes}</Text>}
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.moreButton}
        onPress={() => navigation.navigate('EditAppointment', { appointmentId: item.id })}
      >
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Календарь</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddAppointment', { date: selectedDate })}
        >
          <Ionicons name="add" size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      <Calendar
        current={selectedDate}
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
        markedDates={{
          ...markedDates,
          [selectedDate]: { ...markedDates[selectedDate], selected: true, selectedColor: colors.primary },
        }}
        firstDay={1}
        theme={{
          calendarBackground: colors.background,
          textSectionTitleColor: colors.textSecondary,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: colors.background,
          todayTextColor: colors.primary,
          dayTextColor: colors.text,
          textDisabledColor: colors.textMuted,
          dotColor: colors.primary,
          selectedDotColor: colors.background,
          arrowColor: colors.primary,
          monthTextColor: colors.text,
          textDayFontWeight: '500',
          textMonthFontWeight: '700',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 15,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 13,
        }}
        style={styles.calendar}
      />

      <View style={styles.dayHeader}>
        <Text style={styles.dayTitle}>{formatDateFull(selectedDate)}</Text>
        <Text style={styles.dayCount}>{appointments.length} записей</Text>
      </View>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAppointment}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>Нет записей на этот день</Text>
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
  calendar: {
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.md,
  },
  dayTitle: {
    ...typography.body,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dayCount: {
    ...typography.caption,
    color: colors.primary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  timeStrip: {
    marginRight: spacing.md,
  },
  timeStripLine: {
    width: 3,
    height: 40,
    borderRadius: 2,
  },
  timeColumn: {
    width: 50,
    marginRight: spacing.md,
  },
  timeStart: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
    fontSize: 14,
  },
  timeEnd: {
    ...typography.caption,
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    ...typography.body,
    fontWeight: '600',
  },
  walkinBadge: {
    color: colors.textMuted,
    fontWeight: '400',
    fontSize: 12,
  },
  cardService: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardNotes: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    fontStyle: 'italic',
  },
  moreButton: {
    padding: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    ...typography.bodySecondary,
    marginTop: spacing.md,
  },
});
