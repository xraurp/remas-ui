import { AxiosError } from 'axios';
import { api } from 'src/boot/axios';
import type { NodeResource } from 'src/components/db_models';
import { Unit } from 'src/components/db_models';

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
  return amount;
}

export function getAmountStr(resource: NodeResource): string | undefined {
  if (resource.amount === undefined) {
    return undefined;
  }
  if (resource.unit === Unit.BYTES_SI || resource.unit === Unit.BYTES_IEC) {
    const { amount, unit_str } = getBytesConversion(
      resource.amount,
      resource.unit,
    );
    return `${amount} ${unit_str}`;
  }
  return `${resource.amount}`;
}
