import { AxiosError } from 'axios';
import { api } from 'src/boot/axios';
import type { NodeResource, User } from 'src/components/db_models';
import { Unit, NotificationType } from 'src/components/db_models';

export function getFirstLetter(user: User): string {
  if (user.name && user.surname) {
    return user.name.charAt(0);
  }
  return user.username.charAt(0);
}

export function getMessageFromError(error: unknown, defaultMessage: string) {
  let errorMessage = defaultMessage;
  if (error instanceof AxiosError && error.response) {
    errorMessage = error.response?.data.detail;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }
  return errorMessage;
}

export function getNumericId(id: string | undefined): number | undefined {
  if (id && id !== 'new') return Number(id);
  else return undefined;
}

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

export const notificationTypeStrList = [
  'Task start',
  'Task end',
  'Resource exceedance during task',
  'Resource exceedance',
];

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

export function isAlertNotification(notificationType: NotificationType) {
  return (
    notificationType === NotificationType.grafana_resource_exceedance ||
    notificationType === NotificationType.grafana_resource_exceedance_general
  );
}

export function getUnitList(unit: Unit = Unit.NONE): string[] {
  if (unit === Unit.BYTES_SI) {
    return ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  }
  if (unit === Unit.BYTES_IEC) {
    return ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  }
  return [''];
}

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

export function getConversion(
  amount: number,
  unit: Unit = Unit.NONE,
): { amount: number; unit_str: string } {
  if (unit === Unit.NONE) {
    return { amount, unit_str: '' };
  }
  return getBytesConversion(amount, unit);
}

export function getAmountStr(resource: NodeResource): string | undefined {
  if (resource.amount === undefined) {
    return undefined;
  }
  const { amount, unit_str } = getConversion(resource.amount, resource.unit);
  return `${amount} ${unit_str}`.trim();
}
