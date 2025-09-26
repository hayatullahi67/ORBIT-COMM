// eSIM API Configuration
const ESIM_API_BASE = 'https://esimcard.com/api/developer/reseller';
const ESIM_CREDENTIALS = {
  email: 'johnomodiagbe44@gmail.com',
  password: '247sim.netqp@#$'
};

// Token cache
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export interface Esim {
  id: number;
  name: string;
  plan: string;
  country: string;
  region: string;
  dataTotal: string;
  dataUsed: string;
  dataRemaining: string;
  status: string;
  expires: string;
  activated: string | null;
  speed: string;
  countries: string[];
  price: string;
}

export interface EsimCountry {
  id: string;
  name: string;
  iso: string;
  code_alpha3: string;
  flag_url: string;
  banner_url: string;
}

export interface EsimPackage {
  id: string;
  name: string;
  data: string;
  validity: string;
  price: number;
}

// Authentication functions
const getAccessToken = async (): Promise<string> => {
  console.log('🔐 Getting access token...');

  // Check if we have a valid cached token
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('✅ Using cached token');
    return cachedToken;
  }

  try {
    console.log('🚀 Logging in to eSIM API...');
    const loginUrl = `${ESIM_API_BASE}/login`;

    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(ESIM_CREDENTIALS)
    });

    console.log('📥 Login response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Login failed:', response.status, errorText);
      throw new Error(`Login failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Login successful! Token received:', data.access_token ? 'YES' : 'NO');

    // Try multiple possible paths for access_token
    cachedToken = data.access_token || data.token || data?.data?.access_token;

    if (!cachedToken) {
      throw new Error('No access_token found in login response');
    }

    // Cache for 50 minutes (assuming 1 hour expiry)
    if (data.expires_in) {
      tokenExpiry = Date.now() + (data.expires_in * 1000) - (60 * 1000);
    } else {
      tokenExpiry = Date.now() + (50 * 60 * 1000);
    }

    return cachedToken;
  } catch (error) {
    console.error('❌ eSIM API login error:', error);
    throw error;
  }
};

const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
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

export const getMyESIMs = async (): Promise<{ esims: Esim[] }> => {
  console.log('👤 FRONTEND: Fetching user eSIMs...');

  try {
    const response = await makeAuthenticatedRequest(`${ESIM_API_BASE}/esims`);

    console.log('📥 FRONTEND: User eSIMs response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FRONTEND: User eSIMs API error:', response.status, errorText);
      throw new Error(`User eSIMs API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📄 FRONTEND: Raw user eSIMs response:', data);

    // Transform the data to match your frontend interface
    const transformedData = {
      esims: Array.isArray(data) ? data : (data.data || data.esims || [])
    };

    console.log('✅ FRONTEND: User eSIMs count:', transformedData.esims.length);

    return transformedData;
  } catch (error) {
    console.error('❌ FRONTEND: User eSIMs fetch error:', error);
    throw error;
  }
};

export const getEsimCountries = async (): Promise<EsimCountry[]> => {
  console.log('🌍 FRONTEND: Fetching countries...');

  try {
    const countriesUrl = `${ESIM_API_BASE}/packages/country`;
    console.log('📡 Fetching countries from:', countriesUrl);

    const response = await makeAuthenticatedRequest(countriesUrl);
    console.log('📥 Countries response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ eSIM countries API error:', response.status, errorText);
      throw new Error(`Countries API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📄 RAW COUNTRIES DATA FROM API:', JSON.stringify(data, null, 2));

    // Handle the actual API response format: {status: true, data: [array of country objects]}
    let countries: EsimCountry[] = [];

    if (data.status && data.data && Array.isArray(data.data)) {
      // The data.data contains an array of country objects
      countries = data.data.map((country: any) => ({
        id: country.id.toString(),
        name: country.name,
        iso: country.code.toUpperCase(),
        code_alpha3: country.code_alpha3,
        flag_url: country.image_url,
        banner_url: country.banner || ''
      }));
    } else if (Array.isArray(data)) {
      // Fallback: if it's a direct array of countries
      countries = data.map((country: any) => ({
        id: country.id.toString(),
        name: country.name,
        iso: country.code.toUpperCase(),
        code_alpha3: country.code_alpha3,
        flag_url: country.image_url,
        banner_url: country.banner || ''
      }));
    } else {
      console.error('❌ Unexpected countries data format:', data);
    }

    console.log('✅ PROCESSED COUNTRIES COUNT:', countries.length);
    console.log('🔍 FIRST 5 COUNTRIES:', JSON.stringify(countries.slice(0, 5), null, 2));

    return countries;
  } catch (error) {
    console.error('❌ FRONTEND: Countries fetch error:', error);
    throw error;
  }
};

export const getEsimPackages = async (countryId: string, packageType: string): Promise<EsimPackage[]> => {
  console.log('📦 FRONTEND: Fetching packages for countryId:', countryId, 'packageType:', packageType);

  if (!countryId) {
    throw new Error('countryId parameter is required');
  }

  if (!packageType) {
    throw new Error('packageType parameter is required (DATA-ONLY or DATA-VOICE-SMS)');
  }

  // Validate package type
  if (!['DATA-ONLY', 'DATA-VOICE-SMS'].includes(packageType)) {
    throw new Error('packageType must be DATA-ONLY or DATA-VOICE-SMS');
  }

  try {
    const packagesUrl = `${ESIM_API_BASE}/packages/country/${countryId}/${packageType}`;
    console.log('📦 PACKAGES API: Making request to:', packagesUrl);

    const response = await makeAuthenticatedRequest(packagesUrl);
    console.log('� PackaEges response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ eSIM packages API error:', response.status, errorText);
      throw new Error(`Packages API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📦 PACKAGES API: Response data:', data);
    console.log('📦 PACKAGES API: Number of packages:', Array.isArray(data) ? data.length : 'Not an array');

    // Handle the API response format - extract the actual packages data
    let packages: EsimPackage[] = [];

    if (data.status && data.data) {
      packages = Array.isArray(data.data) ? data.data : [];
    } else if (Array.isArray(data)) {
      packages = data;
    } else {
      console.error('❌ Unexpected packages data format:', data);
    }

    console.log('✅ PROCESSED PACKAGES COUNT:', packages.length);
    console.log('🔍 FIRST 3 PACKAGES:', JSON.stringify(packages.slice(0, 3), null, 2));

    return packages;
  } catch (error) {
    console.error('❌ FRONTEND: Packages fetch error:', error);
    throw error;
  }
};

export interface EsimPackageDetails {
  id: string;
  name: string;
  price: string;
  data_quantity: number;
  data_unit: string;
  voice_quantity: number;
  voice_unit: string;
  sms_quantity: number;
  package_validity: number;
  package_validity_unit: string;
  romaing_countries: Array<{
    id: number;
    name: string;
    image_url: string;
    network_coverage: Array<{
      network_name: string;
      network_code: string;
      two_g: boolean;
      three_g: boolean;
      four_G: boolean;
      five_G: boolean;
    }>;
  }>;
  countries: Array<{
    id: number;
    name: string;
    image_url: string;
    network_coverage: Array<{
      network_name: string;
      network_code: string;
      two_g: boolean;
      three_g: boolean;
      four_G: boolean;
      five_G: boolean;
    }>;
  }>;
}

export const getEsimPackageDetails = async (packageId: string): Promise<EsimPackageDetails> => {
  console.log('📋 FRONTEND: Fetching package details for packageId:', packageId);

  if (!packageId) {
    throw new Error('packageId parameter is required');
  }

  try {
    const detailsUrl = `${ESIM_API_BASE}/package/detail/${packageId}`;
    console.log('📋 PACKAGE DETAILS API: Making request to:', detailsUrl);

    const response = await makeAuthenticatedRequest(detailsUrl);
    console.log('📥 Package details response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ eSIM package details API error:', response.status, errorText);
      throw new Error(`Package details API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('� FPACKAGE DETAILS API: Response data:', data);

    // Return the data.data if it exists, otherwise return data
    return data.data || data;
  } catch (error) {
    console.error('❌ FRONTEND: Package details fetch error:', error);
    throw error;
  }
};

export interface EsimPurchaseResponse {
  status: boolean;
  data: {
    sim_applied: boolean;
    sim?: {
      id: string;
      iccid: string;
      qr_code_text: string;
      smdp_address: string;
      matching_id: string;
      created_at: string;
      last_bundle: string;
      status: string;
      total_bundles: number;
      puk_code?: string;
      installed_at?: string;
      number?: string;
      apn?: string;
      imei?: string;
    };
    package?: {
      id: string;
      package_type_id: string;
      sim_id: string;
      package_name: string;
      date_created: string;
      date_activated: string;
      date_expiry: string;
      activated: boolean;
      status: string;
      unlimited: boolean;
      initial_data_quantity: number;
      initial_data_unit: string;
      rem_data_quantity: number;
      rem_data_unit: string;
    };
    // Fallback properties for flattened structure
    id?: string;
    package_type_id?: string;
    sim_id?: string;
    package_name?: string;
    date_created?: string;
    date_activated?: string;
    date_expiry?: string;
    activated?: boolean;
    purchase_status?: string;
    unlimited?: boolean;
    initial_data_quantity?: number;
    initial_data_unit?: string;
    rem_data_quantity?: number;
    rem_data_unit?: string;
  };
  message?: string;
  error?: any[];
}

export const purchaseEsimPackage = async (packageId: string, packageType: 'DATA-ONLY' | 'DATA-VOICE-SMS'): Promise<EsimPurchaseResponse> => {
  console.log('💳 FRONTEND: Purchasing package:', packageId, 'Type:', packageType);

  if (!packageId) {
    throw new Error('packageId is required');
  }

  if (!packageType) {
    throw new Error('packageType is required (DATA-ONLY or DATA-VOICE-SMS)');
  }

  // Validate package type
  if (!['DATA-ONLY', 'DATA-VOICE-SMS'].includes(packageType)) {
    throw new Error('packageType must be DATA-ONLY or DATA-VOICE-SMS');
  }

  try {
    let purchaseUrl: string;
    let requestBody: any;

    if (packageType === 'DATA-ONLY') {
      // For DATA-ONLY packages
      purchaseUrl = `${ESIM_API_BASE}/package/purchase?test=true`;
      requestBody = {
        package_type_id: packageId
      };
    } else {
      // For DATA-VOICE-SMS packages
      purchaseUrl = `${ESIM_API_BASE}/package/date_voice_sms/purchase`;
      requestBody = {
        package_type_id: packageId
      };
    }

    console.log('💳 PURCHASE API: Making request to:', purchaseUrl);
    console.log('💳 PURCHASE API: Request body:', requestBody);

    const response = await makeAuthenticatedRequest(purchaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Purchase response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ eSIM purchase API error:', response.status, errorText);
      throw new Error(`Purchase API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('💳 PURCHASE API: Response data:', data);

    return data;
  } catch (error) {
    console.error('❌ FRONTEND: Purchase fetch error:', error);
    throw error;
  }
};
