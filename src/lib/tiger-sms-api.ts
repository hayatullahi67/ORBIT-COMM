// Tiger SMS API Configuration
const TIGER_SMS_API_BASE = import.meta.env.DEV 
  ? '/api/tiger-sms' // Use proxy in development
  : 'https://api.tiger-sms.com/stubs/handler_api.php'; // Direct API in production

export interface TigerSMSParams {
  api_key?: string;
  action?: string;
  service?: string;
  country?: string;
  ref?: string;
  status?: string;
  id?: string;
}

export interface TigerSMSResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const callTigerSMSAPI = async (params: TigerSMSParams): Promise<string> => {
  console.log('🐅 TIGER SMS: Making API request with params:', params);
  
  try {
    // Build the URL with query parameters
    const urlParams = new URLSearchParams();
    
    if (params.api_key) urlParams.append('api_key', params.api_key);
    if (params.action) urlParams.append('action', params.action);
    if (params.service) urlParams.append('service', params.service);
    if (params.country) urlParams.append('country', params.country);
    if (params.ref) urlParams.append('ref', params.ref);
    if (params.status) urlParams.append('status', params.status);
    if (params.id) urlParams.append('id', params.id);
    
    const url = `${TIGER_SMS_API_BASE}?${urlParams.toString()}`;
    console.log('🐅 TIGER SMS: Request URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Tiger SMS API request failed: ${response.status} - ${response.statusText}`);
    }
    
    const text = await response.text();
    console.log('🐅 TIGER SMS: Response:', text);
    
    return text;
  } catch (error) {
    console.error('❌ TIGER SMS: API error:', error);
    throw error;
  }
};

// Helper functions for common Tiger SMS operations
export const getBalance = async (apiKey: string): Promise<string> => {
  return callTigerSMSAPI({
    api_key: apiKey,
    action: 'getBalance'
  });
};

export const getCountries = async (apiKey: string): Promise<string> => {
  return callTigerSMSAPI({
    api_key: apiKey,
    action: 'getCountries'
  });
};

export const getServices = async (apiKey: string, country?: string): Promise<string> => {
  return callTigerSMSAPI({
    api_key: apiKey,
    action: 'getServices',
    country
  });
};

export const getNumber = async (apiKey: string, service: string, country: string): Promise<string> => {
  return callTigerSMSAPI({
    api_key: apiKey,
    action: 'getNumber',
    service,
    country
  });
};

export const getStatus = async (apiKey: string, id: string): Promise<string> => {
  return callTigerSMSAPI({
    api_key: apiKey,
    action: 'getStatus',
    id
  });
};

export const setStatus = async (apiKey: string, id: string, status: string): Promise<string> => {
  return callTigerSMSAPI({
    api_key: apiKey,
    action: 'setStatus',
    id,
    status
  });
};

export const getPrices = async (apiKey: string, service?: string, country?: string): Promise<string> => {
  return callTigerSMSAPI({
    api_key: apiKey,
    action: 'getPrices',
    service,
    country
  });
};