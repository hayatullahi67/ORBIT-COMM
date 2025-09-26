/**
 * Authentication Service for eSIM API
 * 
 * This service is simplified since authentication is now handled server-side
 * by the API routes. The esim-auth.js module handles token management
 * automatically on the server side.
 * 
 * Usage:
 * - All API calls in esim-api.ts use standard fetch calls
 * - Authentication is handled transparently by the API routes
 * - No need for client-side token management
 */

class AuthService {
  private static instance: AuthService;

  private constructor() {
    // No client-side token management needed
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // Since authentication is handled server-side, just make a regular fetch call
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers
    };

    return fetch(url, {
      ...options,
      headers
    });
  }

  public clearToken(): void {
    // No client-side token to clear
    console.log('No client-side authentication tokens to clear');
  }
}

export default AuthService;