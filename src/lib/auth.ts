// Authentication system using localStorage
export interface User {
  email: string;
  customer_code?: string;
  created_at?: string;
}

export interface StoredAccount {
  email: string;
  password: string; // Hashed in real app, plain for demo
  customer_code?: string;
  created_at: string;
}

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  try {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Save current user to localStorage (without password)
export const saveCurrentUser = (user: User): void => {
  try {
    localStorage.setItem('currentUser', JSON.stringify({
      ...user,
      created_at: user.created_at || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error saving current user:', error);
  }
};

// Get all stored accounts
export const getStoredAccounts = (): StoredAccount[] => {
  try {
    const accounts = localStorage.getItem('userAccounts');
    return accounts ? JSON.parse(accounts) : [];
  } catch (error) {
    console.error('Error getting stored accounts:', error);
    return [];
  }
};

// Save account to accounts list
export const saveAccount = (account: StoredAccount): void => {
  try {
    const accounts = getStoredAccounts();
    const existingIndex = accounts.findIndex(acc => acc.email === account.email);

    if (existingIndex >= 0) {
      accounts[existingIndex] = account;
    } else {
      accounts.push(account);
    }

    localStorage.setItem('userAccounts', JSON.stringify(accounts));
  } catch (error) {
    console.error('Error saving account:', error);
  }
};

// Create new account
export const createAccount = (email: string, password: string): User => {
  const accounts = getStoredAccounts();

  // Check if account already exists
  const existingAccount = accounts.find(acc => acc.email === email);
  if (existingAccount) {
    throw new Error('Account with this email already exists');
  }

  // Create new account
  const newAccount: StoredAccount = {
    email,
    password, // In real app, hash this password
    created_at: new Date().toISOString()
  };

  // Save to accounts list
  saveAccount(newAccount);

  // Create user object (without password)
  const user: User = {
    email,
    created_at: newAccount.created_at
  };

  // Set as current user
  saveCurrentUser(user);

  return user;
};

// Login user with credentials validation
export const loginUser = (email: string, password: string): User => {
  const accounts = getStoredAccounts();

  // Find account with matching email and password
  const account = accounts.find(acc => acc.email === email && acc.password === password);

  if (!account) {
    throw new Error('Incorrect email or password');
  }

  // Create user object (without password)
  const user: User = {
    email: account.email,
    customer_code: account.customer_code,
    created_at: account.created_at
  };

  // Set as current user
  saveCurrentUser(user);

  return user;
};

// Logout user
export const logoutUser = (): void => {
  localStorage.removeItem('currentUser');
};

// Check if user is logged in
export const isLoggedIn = (): boolean => {
  return getCurrentUser() !== null;
};

// Simple email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};