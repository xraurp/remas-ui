import { date } from 'quasar';

export const dateFormat = 'YYYY-MM-DD HH:mm';

/**
 * Converts datetime to YYYY-MM-DD HH:mm format
 * @param {string} datetime The datetime to convert (eg. 2025-04-11T12:37:00Z)
 * @returns {string} The datetime in YYYY-MM-DD HH:mm format (eg. 2025-04-11 12:37)
 */
export function formatDatetime(datetime: string) {
  return date.formatDate(new Date(datetime), dateFormat);
}
