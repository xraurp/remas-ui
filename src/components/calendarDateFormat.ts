import { date } from 'quasar';

export const dateFormat = 'YYYY-MM-DD HH:mm';

export function formatDatetime(datetime: string) {
  return date.formatDate(new Date(datetime), dateFormat);
}
