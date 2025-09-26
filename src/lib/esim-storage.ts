// Utility functions for managing eSIMs in localStorage

export interface StoredEsim {
  id: string;
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
  // Additional fields from purchase response
  simId?: string;
  iccid?: string;
  phoneNumber?: string;
  apn?: string;
  // eSIM activation fields
  qr_code_text?: string;
  smdp_address?: string;
  matching_id?: string;
  activation_code?: string;
  packageType: 'DATA-ONLY' | 'DATA-VOICE-SMS';
  purchaseDate: string;
  // Raw purchase data for reference
  purchaseData?: any;
}

const ESIMS_STORAGE_KEY = 'purchased_esims';

export const getStoredEsims = (): StoredEsim[] => {
  try {
    const stored = localStorage.getItem(ESIMS_STORAGE_KEY);
    if (!stored) return [];

    const esims = JSON.parse(stored);
    console.log('📱 STORAGE: Retrieved eSIMs from localStorage:', esims);
    return Array.isArray(esims) ? esims : [];
  } catch (error) {
    console.error('❌ STORAGE: Error retrieving eSIMs from localStorage:', error);
    return [];
  }
};

export const saveEsimToStorage = (esim: StoredEsim): void => {
  try {
    const existingEsims = getStoredEsims();

    // Check if eSIM already exists (by ID)
    const existingIndex = existingEsims.findIndex(e => e.id === esim.id);

    if (existingIndex >= 0) {
      // Update existing eSIM
      existingEsims[existingIndex] = esim;
      console.log('📱 STORAGE: Updated existing eSIM:', esim.id);
    } else {
      // Add new eSIM
      existingEsims.push(esim);
      console.log('📱 STORAGE: Added new eSIM:', esim.id);
    }

    localStorage.setItem(ESIMS_STORAGE_KEY, JSON.stringify(existingEsims));
    console.log('📱 STORAGE: Saved eSIMs to localStorage. Total count:', existingEsims.length);
  } catch (error) {
    console.error('❌ STORAGE: Error saving eSIM to localStorage:', error);
  }
};

export const removeEsimFromStorage = (esimId: string): void => {
  try {
    const existingEsims = getStoredEsims();
    const filteredEsims = existingEsims.filter(e => e.id !== esimId);

    localStorage.setItem(ESIMS_STORAGE_KEY, JSON.stringify(filteredEsims));
    console.log('📱 STORAGE: Removed eSIM from localStorage:', esimId);
  } catch (error) {
    console.error('❌ STORAGE: Error removing eSIM from localStorage:', error);
  }
};

export const clearAllEsims = (): void => {
  try {
    localStorage.removeItem(ESIMS_STORAGE_KEY);
    console.log('📱 STORAGE: Cleared all eSIMs from localStorage');
  } catch (error) {
    console.error('❌ STORAGE: Error clearing eSIMs from localStorage:', error);
  }
};

// Helper function to convert purchase response to StoredEsim format
export const convertPurchaseToStoredEsim = (
  purchaseResponse: any,
  packageDetails: any,
  packageType: 'DATA-ONLY' | 'DATA-VOICE-SMS',
  selectedCountry: any
): StoredEsim => {
  const data = purchaseResponse.data;
  const sim = data.sim;
  const packageInfo = data.package || data;

  // 🔍 LOG ESIM ACTIVATION FIELDS
  console.log('📱 ESIM ACTIVATION FIELDS - Full Purchase Response:', purchaseResponse);
  console.log('📱 ESIM ACTIVATION FIELDS - Data Object:', data);
  console.log('📱 ESIM ACTIVATION FIELDS - Sim Object:', sim);
  console.log('📱 ESIM ACTIVATION FIELDS - Package Info:', packageInfo);

  // Log specific activation fields
  console.log('🔑 ICCID (from sim):', sim?.iccid);
  console.log('🔑 ICCID (from data):', data?.iccid);
  console.log('📱 QR_CODE_TEXT (from sim):', sim?.qr_code_text);
  console.log('📱 QR_CODE_TEXT (from data):', data?.qr_code_text);
  console.log('🌐 SMDP_ADDRESS (from sim):', sim?.smdp_address);
  console.log('🌐 SMDP_ADDRESS (from data):', data?.smdp_address);
  console.log('🎯 MATCHING_ID (from sim):', sim?.matching_id);
  console.log('🎯 MATCHING_ID (from data):', data?.matching_id);
  console.log('🔐 ACTIVATION_CODE (from sim):', sim?.activation_code);
  console.log('🔐 ACTIVATION_CODE (from data):', data?.activation_code);
  console.log('📞 PHONE_NUMBER (from sim):', sim?.number);
  console.log('📞 PHONE_NUMBER (from data):', data?.number);
  console.log('🌍 APN (from sim):', sim?.apn);
  console.log('🌍 APN (from data):', data?.apn);

  // Calculate expiry date
  const expiryDate = packageInfo.date_expiry || packageInfo.date_expiry;
  const activatedDate = packageInfo.date_activated || packageInfo.date_activated || packageInfo.date_created;

  // Determine status based on purchase response
  let status = 'Active';
  if (packageInfo.status === 'Initiated' || packageInfo.status === 'Pre-Service') {
    status = 'Inactive';
  } else if (packageInfo.status === 'Revoked') {
    status = 'Expired';
  }

  // Calculate data usage (initially 0 for new purchases)
  const dataTotal = `${packageInfo.initial_data_quantity || packageDetails.data_quantity}${packageInfo.initial_data_unit || packageDetails.data_unit}`;
  const dataUsed = '0GB';
  const dataRemaining = dataTotal;

  return {
    id: packageInfo.id || sim?.id || `esim_${Date.now()}`,
    name: packageDetails.name || packageInfo.package || sim?.last_bundle || 'eSIM Package',
    plan: packageType === 'DATA-ONLY' ? 'Data Only Plan' : 'Data + Voice + SMS Plan',
    country: selectedCountry?.name || 'Unknown',
    region: selectedCountry?.name || 'Unknown',
    dataTotal,
    dataUsed,
    dataRemaining,
    status,
    expires: expiryDate ? new Date(expiryDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    activated: activatedDate ? new Date(activatedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    speed: packageType === 'DATA-ONLY' ? '4G' : '5G',
    countries: [selectedCountry?.name || 'Unknown'],
    price: `$${packageDetails.price}`,
    // Additional fields
    simId: sim?.id,
    iccid: sim?.iccid || data?.iccid,
    phoneNumber: sim?.number || data?.number,
    apn: sim?.apn || data?.apn,
    // eSIM activation fields
    qr_code_text: sim?.qr_code_text || data?.qr_code_text,
    smdp_address: sim?.smdp_address || data?.smdp_address,
    matching_id: sim?.matching_id || data?.matching_id,
    activation_code: sim?.activation_code || data?.activation_code,
    packageType,
    purchaseDate: new Date().toISOString(),
    purchaseData: purchaseResponse
  };

  const storedEsim = {
    id: packageInfo.id || sim?.id || `esim_${Date.now()}`,
    name: packageDetails.name || packageInfo.package || sim?.last_bundle || 'eSIM Package',
    plan: packageType === 'DATA-ONLY' ? 'Data Only Plan' : 'Data + Voice + SMS Plan',
    country: selectedCountry?.name || 'Unknown',
    region: selectedCountry?.name || 'Unknown',
    dataTotal,
    dataUsed,
    dataRemaining,
    status,
    expires: expiryDate ? new Date(expiryDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    activated: activatedDate ? new Date(activatedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    speed: packageType === 'DATA-ONLY' ? '4G' : '5G',
    countries: [selectedCountry?.name || 'Unknown'],
    price: `${packageDetails.price}`,
    // Additional fields
    simId: sim?.id,
    iccid: sim?.iccid || data?.iccid,
    phoneNumber: sim?.number || data?.number,
    apn: sim?.apn || data?.apn,
    // eSIM activation fields
    qr_code_text: sim?.qr_code_text || data?.qr_code_text,
    smdp_address: sim?.smdp_address || data?.smdp_address,
    matching_id: sim?.matching_id || data?.matching_id,
    activation_code: sim?.activation_code || data?.activation_code,
    packageType,
    purchaseDate: new Date().toISOString(),
    purchaseData: purchaseResponse
  };

  // 📋 LOG FINAL STORED ESIM DATA
  console.log('💾 FINAL STORED ESIM DATA:', {
    id: storedEsim.id,
    iccid: storedEsim.iccid,
    qr_code_text: storedEsim.qr_code_text,
    smdp_address: storedEsim.smdp_address,
    matching_id: storedEsim.matching_id,
    activation_code: storedEsim.activation_code,
    phoneNumber: storedEsim.phoneNumber,
    apn: storedEsim.apn
  });

  return storedEsim;
};