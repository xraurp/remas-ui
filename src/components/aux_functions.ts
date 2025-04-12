import { AxiosError } from 'axios';

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
