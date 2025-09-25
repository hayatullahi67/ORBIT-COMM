// GET /api/esim-packages?countryId=XX&packageType=DATA-ONLY
// Proxies to https://esimcard.com/api/developer/reseller/packages/country/:id/:package_type

const { makeAuthenticatedRequest } = require('./esim-auth.js');

const ESIM_API_BASE = 'https://esimcard.com/api/developer/reseller';

module.exports = async function handler(req, res) {
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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { countryId, packageType } = req.query;

  console.log('📦 PACKAGES API: Received countryId:', countryId);
  console.log('📦 PACKAGES API: Received packageType:', packageType);

  if (!countryId) {
    return res.status(400).json({ error: 'countryId parameter is required' });
  }

  if (!packageType) {
    return res.status(400).json({ error: 'packageType parameter is required (DATA-ONLY or DATA-VOICE-SMS)' });
  }

  // Validate package type
  if (!['DATA-ONLY', 'DATA-VOICE-SMS'].includes(packageType)) {
    return res.status(400).json({ error: 'packageType must be DATA-ONLY or DATA-VOICE-SMS' });
  }

  try {
    const fullUrl = `${ESIM_API_BASE}/packages/country/${countryId}/${packageType}`;
    console.log('📦 PACKAGES API: Making request to:', fullUrl);
    
    const response = await makeAuthenticatedRequest(fullUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('eSIM packages API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to fetch packages',
        details: errorText 
      });
    }

    const data = await response.json();
    console.log('📦 PACKAGES API: Response data:', data);
    console.log('📦 PACKAGES API: Number of packages:', Array.isArray(data) ? data.length : 'Not an array');
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Packages endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}