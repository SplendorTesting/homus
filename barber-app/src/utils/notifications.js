import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Foreground behaviour — show banners + play sound.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('appointments', {
      name: 'Записи',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C8A864',
      sound: 'default',
    });
  }

  if (!Device.isDevice) return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function getPermissionStatus() {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

// Build a Date from 'YYYY-MM-DD' + 'HH:mm', offset back by `minutesBefore`.
function buildTriggerDate(date, time, minutesBefore) {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const target = new Date(y, m - 1, d, hh, mm, 0, 0);
  return new Date(target.getTime() - minutesBefore * 60 * 1000);
}

// Schedule a reminder. Returns the notification id (or null if in the past).
export async function scheduleAppointmentReminder({ clientName, service, date, time, minutesBefore = 60 }) {
  const triggerDate = buildTriggerDate(date, time, minutesBefore);
  if (triggerDate.getTime() <= Date.now()) return null;

  const body = service
    ? `${clientName} · ${service} в ${time}`
    : `${clientName} в ${time}`;

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: minutesBefore >= 60 ? 'Запись через час' : `Запись через ${minutesBefore} мин`,
        body,
        sound: 'default',
        data: { type: 'appointment' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: 'appointments',
      },
    });
    return id;
  } catch (e) {
    console.warn('Failed to schedule reminder', e);
    return null;
  }
}

export async function cancelReminder(notificationId) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    // already fired / invalid
  }
}

export async function getScheduledCount() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return all.length;
}

export async function sendTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Trimmer',
      body: 'Уведомления включены. Мы напомним вам о записях заранее.',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      channelId: 'appointments',
    },
  });
}
