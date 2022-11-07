import { HttpException, HttpStatus } from '@nestjs/common';

export interface Response {
  error?: string;

  message?: string;

  statusCode?: number;

  success: boolean;
}

export const errorResponse = (message, error, statusCode, data): Error =>
  new HttpException(
    {
      ...data,
      error,
      message,
      statusCode,
      success: false,
    },
    statusCode,
  );

export const badRequestExceptionResponse = (message, data = {}): Error =>
  errorResponse(message, 'Bad request', HttpStatus.BAD_REQUEST, data);

export const successResponse = (data = {}): Response => ({
  ...data,
  success: true,
});
