import { AxiosError } from 'axios';
import { api } from 'src/boot/axios';
import type { NodeResource, User } from 'src/components/db_models';
import { Unit, NotificationType } from 'src/components/db_models';

/**
 * Returns the first letter of the user's name or username
 * @param {User} user The user object
 * @returns {string} The first letter of the user's name or username
 */
export function getFirstLetter(user: User): string {
  if (user.name && user.surname) {
    return user.name.charAt(0);
  }
  return user.username.charAt(0);
}

/**
 * Returns the error message from the error object
 * @param {unknown} error The error object
 * @param {string} defaultMessage The default error message
 * @returns {string} The error message
 */
export function getMessageFromError(error: unknown, defaultMessage: string) {
  let errorMessage = defaultMessage;
  if (error instanceof AxiosError && error.response) {
    errorMessage = error.response?.data.detail;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }
  return errorMessage;
}

/**
 * Returns the numeric id of the object
 * @param {string | undefined} id The id of the object
 * @returns {number | undefined} The numeric id of the object
 */
export function getNumericId(id: string | undefined): number | undefined {
  if (id && id !== 'new') return Number(id);
  else return undefined;
}

/**
 * Sends a request to the API
 * @param {string} apiPath The path of the API
 * @param {string} defaultErrorMessage The default error message
 * @param {string} method The method of the request (default: get)
 * @param {T} data The data of the request
 * @returns {Promise<R>} The response of the request
 */
export async function apiRequest<T, R>(
  apiPath: string,
  defaultErrorMessage: string,
  method: string = 'get',
  data?: T,
): Promise<R> {
  let response = null;
  try {
    response = await api({
      method: method,
      url: apiPath,
      data: data,
    });
  } catch (error) {
    if (process.env.debug) {
      console.error(error);
    }
    throw new Error(getMessageFromError(error, defaultErrorMessage));
  }
  return response.data;
}

/**
 * List of notification types for dropdown
 */
export const notificationTypeStrList = [
  'Task start',
  'Task end',
  'Resource exceedance during task',
  'Resource exceedance',
];

/**
 * Returns the notification type from the notification type string
 * @param {string} notificationTypeStr The notification type string
 * @returns {NotificationType} The notification type
 */
export function getNotificationType(
  notificationTypeStr: string,
): NotificationType {
  switch (notificationTypeStr) {
    case notificationTypeStrList[0]:
      return NotificationType.task_start;
    case notificationTypeStrList[1]:
      return NotificationType.task_end;
    case notificationTypeStrList[2]:
      return NotificationType.grafana_resource_exceedance;
    case notificationTypeStrList[3]:
      return NotificationType.grafana_resource_exceedance_general;
    default:
      return NotificationType.other;
  }
}

/**
 * Returns the notification type string from the notification type
 * @param {NotificationType} notificationType The notification type
 * @returns {string} The notification type string
 */
export function getNotificationTypeStr(
  notificationType: NotificationType,
): string {
  let result: string | undefined = undefined;
  switch (notificationType) {
    case NotificationType.task_start:
      result = notificationTypeStrList[0];
      break;
    case NotificationType.task_end:
      result = notificationTypeStrList[1];
      break;
    case NotificationType.grafana_resource_exceedance:
      result = notificationTypeStrList[2];
      break;
    case NotificationType.grafana_resource_exceedance_general:
      result = notificationTypeStrList[3];
      break;
    default:
      result = 'other';
      break;
  }
  return result || 'other';
}

/**
 * Returns true if the notification type is Grafana alert
 * @param {NotificationType} notificationType The notification type
 * @returns {boolean} True if the notification type is Grafana alert
 */
export function isAlertNotification(notificationType: NotificationType) {
  return (
    notificationType === NotificationType.grafana_resource_exceedance ||
    notificationType === NotificationType.grafana_resource_exceedance_general
  );
}

/**
 * Returns the unit list for the given unit
 * @param {Unit} unit The unit
 * @returns {string[]} The unit list
 */
export function getUnitList(unit: Unit = Unit.NONE): string[] {
  if (unit === Unit.BYTES_SI) {
    return ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  }
  if (unit === Unit.BYTES_IEC) {
    return ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
  }
  return [''];
}

/**
 * Returns the amount and unit string for the given bytes and unit
 * @param {number} bytes The bytes (eg. 1536)
 * @param {Unit} unit The unit (eg. Unit.BYTES_IEC)
 * @returns {object} The amount and unit string (eg. { amount: 1.5, unit_str: 'KiB' })
 */
export function getBytesConversion(
  bytes: number,
  unit: Unit = Unit.BYTES_IEC,
): { amount: number; unit_str: string } {
  const unitList = getUnitList(unit);
  const divisor = unit === Unit.BYTES_SI ? 1000 : 1024;
  let i = 0;
  while (bytes >= divisor) {
    bytes /= divisor;
    i++;
    if (i >= unitList.length - 1) {
      break;
    }
  }
  return {
    amount: bytes,
    unit_str: unitList[i] || 'B',
  };
}

/**
 * Returns the amount in bytes for the given bytes and unit
 * @param {number} amount The amount (eg. 1.5)
 * @param {string} unit_str The unit string (eg. KiB)
 * @param {Unit} unit The unit (eg. Unit.BYTES_IEC)
 * @returns {number} The amount in bytes (eg. 1536)
 */
export function getBytesConversionInverse(
  amount: number,
  unit_str: string,
  unit: Unit = Unit.BYTES_IEC,
): number {
  const unitList = getUnitList(unit);
  const divisor = unit === Unit.BYTES_SI ? 1000 : 1024;
  let i = unitList.indexOf(unit_str);
  while (i > 0) {
    amount *= divisor;
    i--;
  }
  // round to prevent allocation of half of a byte, etc.
  return Math.floor(amount);
}

/**
 * Returns the amount in base units for the given amount and unit.
 * Can be used for diferent units then just bytes.
 * @param {number} amount The amount (eg. 1.5)
 * @param {string} unit_str The unit string (eg. KiB)
 * @param {Unit} unit The unit (eg. Unit.BYTES_IEC)
 * @returns {number} The amount in bytes (eg. 1536)
 */
export function getConversionInverse(
  amount: number,
  unit_str: string,
  unit: Unit = Unit.NONE,
): number {
  if (unit === Unit.NONE) {
    // round to prevent allocation of 1.5 of CPU core, etc.
    return Math.floor(amount);
  }
  return getBytesConversionInverse(amount, unit_str, unit);
}

/**
 * Returns the amount and unit string for the given amount.
 * Can be used for diferent units then just bytes.
 * @param {number} amount The amount (eg. 1536)
 * @param {Unit} unit The unit (eg. Unit.BYTES_IEC)
 * @returns {object} The amount and unit string (eg. { amount: 1.5, unit_str: 'KiB' })
 */
export function getConversion(
  amount: number,
  unit: Unit = Unit.NONE,
): { amount: number; unit_str: string } {
  if (unit === Unit.NONE) {
    return { amount, unit_str: '' };
  }
  return getBytesConversion(amount, unit);
}

/**
 * Returns the amount string for the given resource
 * @param {NodeResource} resource The resource
 * @returns {string} The amount string
 */
export function getAmountStr(resource: NodeResource): string | undefined {
  if (resource.amount === undefined) {
    return undefined;
  }
  const { amount, unit_str } = getConversion(resource.amount, resource.unit);
  return `${amount} ${unit_str}`.trim();
}
