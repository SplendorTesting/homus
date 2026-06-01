import * as Linking from 'expo-linking';

export function callPhone(phone) {
  if (!phone) return;
  const cleaned = phone.replace(/[^0-9+]/g, '');
  Linking.openURL(`tel:${cleaned}`);
}

export function openWhatsApp(number) {
  if (!number) return;
  const cleaned = number.replace(/[^0-9]/g, '');
  Linking.openURL(`https://wa.me/${cleaned}`);
}

export function openTelegram(username) {
  if (!username) return;
  const cleaned = username.replace('@', '');
  Linking.openURL(`https://t.me/${cleaned}`);
}

export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

export function formatTime(time) {
  if (!time) return '';
  return time.substring(0, 5);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

export function formatDateFull(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
}

export function getTodayString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}
