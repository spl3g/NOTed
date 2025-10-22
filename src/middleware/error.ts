import { Elysia } from 'elysia';
import type { ApiError } from '../types/api';

export const errorHandler = new Elysia()
  .onError(({ error, set }) => {
    console.error('API Error:', error);

    if (error.message === 'Unauthorized') {
      set.status = 401;
      return {
        error: 'Unauthorized',
        message: 'Authentication required',
        statusCode: 401,
      } as ApiError;
    }

    if (error.message === 'Invalid email or password') {
      set.status = 401;
      return {
        error: 'Authentication Failed',
        message: 'Invalid email or password',
        statusCode: 401,
      } as ApiError;
    }

    if (error.message === 'Failed to create user') {
      set.status = 400;
      return {
        error: 'Registration Failed',
        message: 'Failed to create user',
        statusCode: 400,
      } as ApiError;
    }

    if (error.message === 'Failed to create note') {
      set.status = 400;
      return {
        error: 'Note Creation Failed',
        message: 'Failed to create note',
        statusCode: 400,
      } as ApiError;
    }

    // Default error response
    set.status = 500;
    return {
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      statusCode: 500,
    } as ApiError;
  });