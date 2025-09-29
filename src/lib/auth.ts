// Authentication system using JWT and backend API
const API_BASE_URL = 'https://comiun.onrender.com/api/auth';

export interface User {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface RegisterData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginData {
  loginIdentifier: string; // Can be username or email
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  userId: string;
  username: string;
  firstName: string;
}

// Token management
export const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const saveToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('authToken');
};

// User management
export const getCurrentUser = (): User | null => {
  try {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const saveCurrentUser = (user: User): void => {
  try {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving current user:', error);
  }
};

export const clearCurrentUser = (): void => {
  localStorage.removeItem('currentUser');
};

// API request helper with auth headers
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getToken();
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  console.log('🔍 API Request:', {
    url,
    method: config.method || 'GET',
    headers: config.headers,
    body: options.body
  });

  try {
    const response = await fetch(url, config);
    
    console.log('📡 API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('❌ Failed to parse JSON response:', jsonError);
      throw new Error(`Server returned invalid JSON. Status: ${response.status}`);
    }

    console.log('📦 Response Data:', data);

    if (!response.ok) {
      const errorMessage = data.message || data.error || `Server error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('❌ API Request failed:', error);
    throw error;
  }
};

// Register new user (immediate login)
export const registerUser = async (userData: RegisterData): Promise<User> => {
  console.log('🚀 Starting registration with data:', userData);
  
  // Ensure all required fields are present and properly formatted
  const registrationData = {
    username: userData.username.trim(),
    firstName: userData.firstName.trim(),
    lastName: userData.lastName.trim(),
    email: userData.email.trim().toLowerCase(),
    password: userData.password
  };

  console.log('📝 Formatted registration data:', registrationData);
  
  try {
    const response: AuthResponse = await apiRequest('/register', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });

    console.log('✅ Registration successful:', response);

    // Save token and user data
    saveToken(response.token);
    
    const user: User = {
      userId: response.userId,
      username: response.username,
      firstName: response.firstName,
      lastName: registrationData.lastName, // Use the data we sent
      email: registrationData.email,
    };

    saveCurrentUser(user);
    
    return user;
  } catch (error) {
    console.error('❌ Registration error:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (loginData: LoginData): Promise<User> => {
  console.log('🔐 Starting login with data:', loginData);
  
  try {
    const response: AuthResponse = await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });

    console.log('✅ Login successful:', response);

    // Save token
    saveToken(response.token);
    
    // Fetch complete user data from the current_user endpoint
    const user = await fetchCurrentUser();
    
    return user;
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
};

// Fetch current user details from API
export const fetchCurrentUser = async (): Promise<User> => {
  try {
    const userData = await apiRequest('/current_user');
    
    console.log('👤 Raw user data from API:', userData);
    console.log('🔍 Available fields:', Object.keys(userData));
    
    // Handle different possible field names from the backend
    const user: User = {
      userId: userData._id || userData.userId || userData.id,
      username: userData.username || userData.user || '',
      firstName: userData.firstName || userData.first_name || userData.firstname || '',
      lastName: userData.lastName || userData.last_name || userData.lastname || '',
      email: userData.email || '',
    };

    console.log('✅ Processed user data:', user);
    
    saveCurrentUser(user);
    return user;
  } catch (error) {
    console.error('❌ Fetch current user error:', error);
    // If token is invalid, clear auth data
    clearAuthData();
    throw error;
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    // Call server logout endpoint
    await apiRequest('/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Continue with client-side logout even if server call fails
  } finally {
    // Always clear client-side auth data
    clearAuthData();
  }
};

// Clear all auth data
export const clearAuthData = (): void => {
  removeToken();
  clearCurrentUser();
};

// Check if user is logged in
export const isLoggedIn = (): boolean => {
  return getToken() !== null && getCurrentUser() !== null;
};

// Validate token by making a test API call
export const validateToken = async (): Promise<boolean> => {
  try {
    await fetchCurrentUser();
    return true;
  } catch (error) {
    clearAuthData();
    return false;
  }
};

// Simple email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};