import { useState, useEffect } from 'react';
import AuthService from '@/lib/auth-service';

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
  getAccessToken: () => Promise<string>;
}

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authService = AuthService.getInstance();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to get a valid token
      await authService.getAccessToken();
      setIsAuthenticated(true);
    } catch (err) {
      setIsAuthenticated(false);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.getAccessToken();
      setIsAuthenticated(true);
    } catch (err) {
      setIsAuthenticated(false);
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.clearToken();
    setIsAuthenticated(false);
    setError(null);
  };

  const getAccessToken = async (): Promise<string> => {
    try {
      return await authService.getAccessToken();
    } catch (err) {
      setIsAuthenticated(false);
      setError(err instanceof Error ? err.message : 'Failed to get access token');
      throw err;
    }
  };

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    getAccessToken
  };
};