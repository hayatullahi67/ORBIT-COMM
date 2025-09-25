// Paystack integration for user balance management
export interface PaystackCustomer {
  id: number;
  customer_code: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface PaystackBalance {
  balance: number;
  currency: string;
}

export interface PaystackTransaction {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  customer: PaystackCustomer;
}

// Get current user from localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

// Save user to localStorage
export const saveCurrentUser = (user: { email: string; username: string; customer_code?: string }) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

// Frontend function to get user balance
export const getUserBalance = async (): Promise<number> => {
  const user = getCurrentUser();
  if (!user?.email) {
    console.log('No user found, returning 0 balance');
    return 0;
  }

  try {
    const response = await fetch('/api/paystack/balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: user.email })
    });

    if (!response.ok) {
      throw new Error(`Balance fetch failed: ${response.status}`);
    }

    const data = await response.json();
    return data.balance || 0;
  } catch (error) {
    console.error('Error fetching balance:', error);
    return 0;
  }
};

// Frontend function to initialize payment
export const initializePayment = async (amount: number, email: string) => {
  try {
    const response = await fetch('/api/paystack/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        amount: amount * 100, // Convert to kobo
        email,
        currency: 'USD'
      })
    });

    if (!response.ok) {
      throw new Error(`Payment initialization failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error initializing payment:', error);
    throw error;
  }
};

// Frontend function to verify payment
export const verifyPayment = async (reference: string) => {
  try {
    const response = await fetch('/api/paystack/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reference })
    });

    if (!response.ok) {
      throw new Error(`Payment verification failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};