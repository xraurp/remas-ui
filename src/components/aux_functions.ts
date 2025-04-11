import { AxiosError } from 'axios';

export function getMessageFromError(error: unknown, defaultMessage: string) {
  let errorMessage = defaultMessage;
  if (error instanceof AxiosError) {
    errorMessage = error.response?.data.detail;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }
  return errorMessage;
}
