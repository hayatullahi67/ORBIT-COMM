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
  // Add other properties from the actual API response as needed
}

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  return response.json();
};

export const getMyESIMs = async (): Promise<{ esims: Esim[] }> => {
  console.log('👤 FRONTEND: Fetching user eSIMs...');
  
  try {
    const response = await fetch(`/api/user/esims`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('📥 FRONTEND: User eSIMs response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FRONTEND: User eSIMs API error:', response.status, errorText);
      throw new Error(`User eSIMs API failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('📄 FRONTEND: Raw user eSIMs response:', data);
    console.log('✅ FRONTEND: User eSIMs count:', data?.esims?.length || 0);
    
    return data;
  } catch (error) {
    console.error('❌ FRONTEND: User eSIMs fetch error:', error);
    throw error;
  }
};

export const getEsimCountries = async (): Promise<EsimCountry[]> => {
  console.log('🌍 FRONTEND: Fetching countries...');
  
  try {
    const response = await fetch(`/api/esim/countries`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('📥 FRONTEND: Countries response status:', response.status);
    console.log('📥 FRONTEND: Countries response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FRONTEND: Countries API error:', response.status, errorText);
      throw new Error(`Countries API failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('📄 FRONTEND: Raw countries response:', data);
    console.log('✅ FRONTEND: Countries count:', Array.isArray(data) ? data.length : 'Not an array');
    
    if (Array.isArray(data)) {
      console.log('🔍 FRONTEND: First 3 countries:', data.slice(0, 3));
    }
    
    return data;
  } catch (error) {
    console.error('❌ FRONTEND: Countries fetch error:', error);
    throw error;
  }
};

export const getEsimPackages = async (countryId: string, packageType: string): Promise<EsimPackage[]> => {
  console.log('📦 FRONTEND: Fetching packages for countryId:', countryId, 'packageType:', packageType);
  
  try {
    const response = await fetch(`/api/esim/packages?countryId=${countryId}&packageType=${packageType}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('📥 FRONTEND: Packages response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FRONTEND: Packages API error:', response.status, errorText);
      throw new Error(`Packages API failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('📄 FRONTEND: Raw packages response:', data);
    console.log('✅ FRONTEND: Packages count:', Array.isArray(data) ? data.length : 'Not an array');
    
    if (Array.isArray(data)) {
      console.log('🔍 FRONTEND: First 3 packages:', data.slice(0, 3));
    }
    
    return data;
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
  
  try {
    const response = await fetch(`/api/esim/package-details?packageId=${packageId}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('📥 FRONTEND: Package details response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FRONTEND: Package details API error:', response.status, errorText);
      throw new Error(`Package details API failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('📄 FRONTEND: Raw package details response:', data);
    
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
      package: string;
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
    id?: string;
    package_type_id?: string;
    sim_id?: string;
    package?: string;
    date_created?: string;
    date_activated?: string;
    date_expiry?: string;
    activated?: boolean;
    status?: string;
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
  
  try {
    const response = await fetch('/api/esim/purchase', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        packageId,
        packageType
      })
    });
    
    console.log('📥 FRONTEND: Purchase response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FRONTEND: Purchase API error:', response.status, errorText);
      throw new Error(`Purchase API failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('📄 FRONTEND: Raw purchase response:', data);
    
    return data;
  } catch (error) {
    console.error('❌ FRONTEND: Purchase fetch error:', error);
    throw error;
  }
};
