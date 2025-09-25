// // GET /api/esim/countries
// // Proxies to https://esimcard.com/api/developer/reseller/packages/country

// import { makeAuthenticatedRequest } from './esim-auth.js';

// const ESIM_API_BASE = 'https://esimcard.com/api/developer/reseller';

// export default async function handler(req, res) {
//   if (req.method !== 'GET') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const response = await makeAuthenticatedRequest(`${ESIM_API_BASE}/packages/country`);

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('eSIM countries API error:', response.status, errorText);
//       return res.status(response.status).json({ 
//         error: 'Failed to fetch countries',
//         details: errorText 
//       });
//     }

//     const data = await response.json();

//     // Transform the data to match frontend expectations
//     const countries = Object.entries(data).map(([name, iso]) => ({
//       name,
//       iso: iso
//     }));

//     res.status(200).json(countries);
//   } catch (error) {
//     console.error('Countries endpoint error:', error);
//     res.status(500).json({ 
//       error: 'Internal server error',
//       details: error.message 
//     });
//   }
// }



// GET /api/esim/countries 
// Proxies to https://esimcard.com/api/developer/reseller/packages/country

import { makeAuthenticatedRequest } from './esim-auth.js';

const ESIM_API_BASE = 'https://esimcard.com/api/developer/reseller';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🌍 Fetching countries from eSIM API...');

    const response = await makeAuthenticatedRequest(`${ESIM_API_BASE}/packages/country`);

    console.log('🔎 Raw response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ eSIM countries API error:', response.status, errorText);
      return res.status(response.status).json({
        error: 'Failed to fetch countries',
        details: errorText
      });
    }

    const data = await response.json();

    if (!data || Object.keys(data).length === 0) {
      console.warn('⚠️ No countries returned from provider API');
    } else {
      console.log('✅ Countries API returned data:', data);
    }

    // Transform the data to match frontend expectations
    // The API returns: { "206": { "iso": { "id": 39, "code": "zm", "code_alpha3": "zmb", "name": "Zambia", "image_url": "...", "banner": "..." } } }
    const countries = Object.entries(data).map(([countryId, countryData]) => ({
      id: countryId,
      name: countryData.iso.name,
      iso: countryData.iso.code.toUpperCase(),
      code_alpha3: countryData.iso.code_alpha3,
      flag_url: countryData.iso.image_url,
      banner_url: countryData.iso.banner
    }));

    console.log('📦 Transformed countries for frontend:', countries);

    res.status(200).json(countries);
  } catch (error) {
    console.error('🔥 Countries endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
