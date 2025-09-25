// Internal authentication service for eSIM API
// Handles login and token caching

let cachedToken = null;
let tokenExpiry = null;

const ESIM_API_BASE = 'https://esimcard.com/api/developer/reseller';

export const getAccessToken = async () => {
  // Check if we have a valid cached token
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  // Login to get new token
  try {
    const response = await fetch(`${ESIM_API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: process.env.ESIM_EMAIL || 'johnomodiagbe44@gmail.com',
        password: process.env.ESIM_PASSWORD || '247sim.netqp@#$'
      })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    cachedToken = data.access_token;
    
    // Cache for 50 minutes (assuming 1 hour expiry)
    tokenExpiry = Date.now() + (50 * 60 * 1000);
    
    return cachedToken;
  } catch (error) {
    console.error('eSIM API login error:', error);
    throw error;
  }
};

export const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = await getAccessToken();
  
  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
};