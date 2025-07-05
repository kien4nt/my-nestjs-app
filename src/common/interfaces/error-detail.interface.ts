import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorDetail {
    errorCode: string;
    errorMessage: string;
}

export function getErrorDetail(error: unknown, contextMessage: string = ''): ErrorDetail {
  let errorCode: string;
  let errorMessage: string;

  if (error instanceof HttpException) { 
    errorCode = error.getStatus().toString();
    const response = error.getResponse();

    if (typeof response === 'object' && response !== null &&
        'message' in response && typeof response.message === 'string') {
      errorMessage = response.message;
    } else {
      errorMessage = `HTTP error ${errorCode} occurred ${contextMessage}`;
    }
  } else if (error instanceof Error) {
    // Correctly handle Node.js system errors and database errors with a 'code' property
    errorCode = 'code' in error && typeof error.code === 'string'
      ? error.code 
      : 'UNKNOWN_ERROR';

    errorMessage = error.message
      ? error.message
      : `Unknown error occurred ${contextMessage}`;
  } else {
    // Fallback for non-Error objects (e.g., throwing a string, number, or plain object)
    errorCode = 'UNKNOWN_NON_ERROR_TYPE';
    errorMessage = `An unexpected non-Error object was thrown ${contextMessage}. Value: ${String(error)}`;
  }

  return {
    errorCode: errorCode,
    errorMessage: errorMessage,
  };
}