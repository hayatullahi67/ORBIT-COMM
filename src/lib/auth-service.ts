/**
 * Authentication Service for eSIM API
 * 
 * This service handles the authentication flow for the eSIM API:
 * 1. Automatically logs in using predefined credentials to get an access token
 * 2. Stores the token in localStorage with expiry tracking
 * 3. Automatically refreshes the token when it expires
 * 4. Provides authenticated API calls with proper headers
 * 
 * Usage:
 * - All API calls in esim-api.ts automatically use this service
 * - The service ensures every request includes:
 *   - Accept: application/json header
 *   - Authorization: Bearer {token} header
 * 
 * The login API expects:
 * POST /api/login
 * Body: {"email":"johnomodiagbe44@gmail.com","password":"247sim.netqp@#$"}
 * Response: {"access_token":"...", "expires_in":3600}
 */

interface LoginResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}

interface LoginCredentials {
  email: string;
  password: string;
}

class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  private constructor() {
    // Load token from localStorage if available
    this.loadTokenFromStorage();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private loadTokenFromStorage(): void {
    try {
      const token = localStorage.getItem('esim_access_token');
      const expiry = localStorage.getItem('esim_token_expiry');
      
      if (token && expiry) {
        const expiryTime = parseInt(expiry, 10);
        if (Date.now() < expiryTime) {
          this.accessToken = token;
          this.tokenExpiry = expiryTime;
        } else {
          // Token expired, clear storage
          this.clearTokenFromStorage();
        }
      }
    } catch (error) {
      console.error('Error loading token from storage:', error);
    }
  }

  private saveTokenToStorage(token: string, expiresIn?: number): void {
    try {
      localStorage.setItem('esim_access_token', token);
      
      if (expiresIn) {
        const expiryTime = Date.now() + (expiresIn * 1000);
        localStorage.setItem('esim_token_expiry', expiryTime.toString());
        this.tokenExpiry = expiryTime;
      }
    } catch (error) {
      console.error('Error saving token to storage:', error);
    }
  }

  private clearTokenFromStorage(): void {
    try {
      localStorage.removeItem('esim_access_token');
      localStorage.removeItem('esim_token_expiry');
      this.accessToken = null;
      this.tokenExpiry = null;
    } catch (error) {
      console.error('Error clearing token from storage:', error);
    }
  }

  private async login(): Promise<string> {
    const credentials: LoginCredentials = {
      email: "johnomodiagbe44@gmail.com",
      password: "247sim.netqp@#$"
    };

    try {
      const response = await fetch('/api/esim/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error(`Login failed with status ${response.status}`);
      }

      const data: LoginResponse = await response.json();
      
      if (!data.access_token) {
        throw new Error('No access token received from login API');
      }

      this.accessToken = data.access_token;
      this.saveTokenToStorage(data.access_token, data.expires_in);

      return data.access_token;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Token is missing or expired, get a new one
    return await this.login();
  }

  public async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getAccessToken();
    
    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    return fetch(url, {
      ...options,
      headers
    });
  }

  public clearToken(): void {
    this.clearTokenFromStorage();
  }
}

export default AuthService;