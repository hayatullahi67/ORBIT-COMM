// POST /api/esim-purchase
// Handles purchase for both DATA-ONLY and DATA-VOICE-SMS packages

import { makeAuthenticatedRequest } from './esim-auth.js';

const ESIM_API_BASE = 'https://esimcard.com/api/developer/reseller';

// In-memory storage for order mappings (use database in production)
export const orderMappings = new Map();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { packageId, packageType } = req.body;

  console.log('💳 PURCHASE API: Received packageId:', packageId);
  console.log('💳 PURCHASE API: Received packageType:', packageType);

  if (!packageId) {
    return res.status(400).json({ error: 'packageId is required' });
  }

  if (!packageType) {
    return res.status(400).json({ error: 'packageType is required (DATA-ONLY or DATA-VOICE-SMS)' });
  }

  // Validate package type
  if (!['DATA-ONLY', 'DATA-VOICE-SMS'].includes(packageType)) {
    return res.status(400).json({ error: 'packageType must be DATA-ONLY or DATA-VOICE-SMS' });
  }

  try {
    let purchaseUrl;
    let requestBody;

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
      return res.status(response.status).json({ 
        error: 'Failed to purchase package',
        details: errorText 
      });
    }

    const data = await response.json();
    console.log('💳 PURCHASE API: Response data:', data);
    
    // Generate local order ID and store mapping
    const localOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    orderMappings.set(localOrderId, {
      provider_purchase_id: data.purchase_id || data.id,
      created_at: new Date().toISOString(),
      package_id: packageId,
      package_type: packageType
    });
    
    res.status(200).json({
      ...data,
      local_order_id: localOrderId
    });
  } catch (error) {
    console.error('❌ Purchase endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}