/**
 * Test file for AuthService
 * 
 * This file demonstrates how the authentication flow should work.
 * Run these tests to verify the authentication service is working correctly.
 */

import AuthService from '../auth-service';

// Mock fetch for testing
global.fetch = jest.fn();

describe('AuthService', () => {
  let authService: AuthService;
  
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    // Reset fetch mock
    (fetch as jest.Mock).mockClear();
    // Get fresh instance
    authService = AuthService.getInstance();
  });

  it('should login and return access token', async () => {
    const mockResponse = {
      access_token: 'test-token-123',
      expires_in: 3600
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const token = await authService.getAccessToken();

    expect(fetch).toHaveBeenCalledWith('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'johnomodiagbe44@gmail.com',
        password: '247sim.netqp@#$'
      })
    });

    expect(token).toBe('test-token-123');
  });

  it('should make authenticated requests with proper headers', async () => {
    // Mock login response
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'test-token-123' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: 'test-data' })
      });

    const response = await authService.makeAuthenticatedRequest('/api/test');

    expect(fetch).toHaveBeenLastCalledWith('/api/test', {
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer test-token-123'
      }
    });
  });

  it('should handle login errors gracefully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401
    });

    await expect(authService.getAccessToken()).rejects.toThrow('Login failed with status 401');
  });
});