import AuthService from './auth-service';

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

export const createApiError = (message: string, status?: number, code?: string): ApiError => {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.code = code;
  return error;
};

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof Error) {
    return error as ApiError;
  }
  return createApiError('An unknown error occurred');
};

export const makeAuthenticatedApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 1
): Promise<T> => {
  let lastError: ApiError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = handleApiError(error);
      
      // If it's an authentication error and we haven't exhausted retries
      if (lastError.status === 401 && attempt < maxRetries) {
        // Clear the token and try again
        AuthService.getInstance().clearToken();
        continue;
      }
      
      // For other errors or if we've exhausted retries, throw immediately
      throw lastError;
    }
  }
  
  throw lastError!;
};

export const withApiErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw handleApiError(error);
    }
  };
};