// const { getAccessToken } = require('./esim-auth.js');

// export default async function handler(req, res) {
//   // Set CORS headers first
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  
//   if (req.method === 'OPTIONS') {
//     res.status(200).end();
//     return;
//   }

//   if (req.method !== 'GET') {
//     res.status(405).json({ error: 'Method not allowed' });
//     return;
//   }

//   try {
//     console.log('🔐 Getting access token...');
//     const accessToken = await getAccessToken();
//     console.log('✅ Access token obtained');

//     console.log('📡 Making request to eSIM countries API...');
//     const response = await fetch('https://esimcard.com/api/developer/reseller/packages/country', {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${accessToken}`,
//         'Accept': 'application/json',
//         // 'Content-Type': 'application/json'
//       }
//     });

//     console.log('📥 Response status:', response.status);
//     console.log('📥 Response content-type:', response.headers.get('content-type'));

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('❌ eSIM API error:', response.status, errorText);
//       res.status(500).json({ 
//         error: `eSIM API error: ${response.status}`,
//         details: errorText.substring(0, 200)
//       });
//       return;
//     }

//     const rawText = await response.text();
//     console.log('📄 Raw response (first 200 chars):', rawText.substring(0, 200));

//     let data;
//     try {
//       data = JSON.parse(rawText);
//     } catch (parseError) {
//       console.error('❌ JSON parse error:', parseError);
//       res.status(500).json({ 
//         error: 'Invalid JSON response from eSIM API',
//         rawResponse: rawText.substring(0, 500)
//       });
//       return;
//     }

//     console.log('📊 Parsed data structure:', typeof data, Array.isArray(data) ? 'Array' : 'Object');
//     console.log('📊 Data keys:', Object.keys(data || {}));

//     // Transform to the format expected by frontend
//     let countries = [];
    
//     if (data && typeof data === 'object') {
//       // Handle the actual API response format
//       if (data.status && data.data) {
//         // Format: { status: true, data: { "Country Name": "ISO" } }
//         countries = Object.entries(data.data).map(([name, isoCode], index) => ({
//           id: (index + 1).toString(),
//           name: name,
//           iso: typeof isoCode === 'string' ? isoCode.toUpperCase() : isoCode,
//           code_alpha3: '',
//           flag_url: `https://flagcdn.com/w40/${typeof isoCode === 'string' ? isoCode.toLowerCase() : 'xx'}.png`,
//           banner_url: ''
//         }));
//       } else if (Array.isArray(data)) {
//         // Format: Array of country objects
//         countries = data.map((country, index) => ({
//           id: (country.id || index + 1).toString(),
//           name: country.name || `Country ${index + 1}`,
//           iso: country.iso || 'XX',
//           code_alpha3: country.code_alpha3 || '',
//           flag_url: country.flag_url || `https://flagcdn.com/w40/${(country.iso || 'xx').toLowerCase()}.png`,
//           banner_url: country.banner_url || ''
//         }));
//       } else {
//         // Format: Object with country data (like the API docs show)
//         countries = Object.entries(data).map(([countryId, countryData], index) => ({
//           id: countryId,
//           name: countryData?.iso?.name || countryData?.name || countryId,
//           iso: countryData?.iso?.code?.toUpperCase() || countryData?.iso || 'XX',
//           code_alpha3: countryData?.iso?.code_alpha3 || '',
//           flag_url: countryData?.iso?.image_url || countryData?.flag_url || `https://flagcdn.com/w40/${(countryData?.iso?.code || 'xx').toLowerCase()}.png`,
//           banner_url: countryData?.iso?.banner || countryData?.banner_url || ''
//         }));
//       }
//     }

//     console.log('✅ Processed countries count:', countries.length);
//     if (countries.length > 0) {
//       console.log('🔍 First country:', countries[0]);
//     }

//     // Set JSON content type and return
//     res.setHeader('Content-Type', 'application/json');
//     res.status(200).json(countries);

//   } catch (error) {
//     console.error('❌ Countries API error:', error);
//     res.setHeader('Content-Type', 'application/json');
//     res.status(500).json({ 
//       error: 'Failed to fetch countries', 
//       details: error.message 
//     });
//   }
// }




// const { makeAuthenticatedRequest } = require('./esim-auth.js');

// export default async function handler(req, res) {
//   // Set CORS headers
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  
//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }

//   if (req.method !== 'GET') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     console.log('📡 Making request to eSIM countries API...');

//     const response = await makeAuthenticatedRequest(
//       'https://esimcard.com/api/developer/reseller/packages/country',
//       { method: 'GET' }
//     );

//     console.log('📥 Response status:', response.status);
//     console.log('📥 Response content-type:', response.headers.get('content-type'));

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('❌ eSIM API error:', response.status, errorText.substring(0, 200));
//       return res.status(response.status).json({
//         error: `eSIM API error: ${response.status}`,
//         details: errorText.substring(0, 500)
//       });
//     }

//     // Validate content type
//     const contentType = response.headers.get('content-type');
//     if (!contentType || !contentType.includes('application/json')) {
//       const rawText = await response.text();
//       console.error('❌ Countries API returned non-JSON:', rawText.substring(0, 200));
//       return res.status(500).json({
//         error: 'Countries API returned non-JSON response',
//         contentType,
//         rawResponse: rawText.substring(0, 500)
//       });
//     }

//     const data = await response.json();
//     console.log('📊 Parsed data keys:', Object.keys(data || {}));

//     // Transform to frontend format
//     let countries = [];
//     if (data?.status && data?.data) {
//       // Format: { status: true, data: { "Country Name": "ISO" } }
//       countries = Object.entries(data.data).map(([name, isoCode], index) => ({
//         id: (index + 1).toString(),
//         name,
//         iso: typeof isoCode === 'string' ? isoCode.toUpperCase() : isoCode,
//         code_alpha3: '',
//         flag_url: `https://flagcdn.com/w40/${typeof isoCode === 'string' ? isoCode.toLowerCase() : 'xx'}.png`,
//         banner_url: ''
//       }));
//     } else if (Array.isArray(data)) {
//       countries = data.map((country, index) => ({
//         id: (country.id || index + 1).toString(),
//         name: country.name || `Country ${index + 1}`,
//         iso: country.iso || 'XX',
//         code_alpha3: country.code_alpha3 || '',
//         flag_url: country.flag_url || `https://flagcdn.com/w40/${(country.iso || 'xx').toLowerCase()}.png`,
//         banner_url: country.banner_url || ''
//       }));
//     } else if (typeof data === 'object') {
//       countries = Object.entries(data).map(([countryId, countryData]) => ({
//         id: countryId,
//         name: countryData?.iso?.name || countryData?.name || countryId,
//         iso: countryData?.iso?.code?.toUpperCase() || countryData?.iso || 'XX',
//         code_alpha3: countryData?.iso?.code_alpha3 || '',
//         flag_url: countryData?.iso?.image_url || countryData?.flag_url || `https://flagcdn.com/w40/${(countryData?.iso?.code || 'xx').toLowerCase()}.png`,
//         banner_url: countryData?.iso?.banner || countryData?.banner_url || ''
//       }));
//     }

//     console.log('✅ Processed countries count:', countries.length);
//     if (countries.length > 0) {
//       console.log('🔍 First country:', countries[0]);
//     }

//     res.setHeader('Content-Type', 'application/json');
//     return res.status(200).json(countries);

//   } catch (error) {
//     console.error('❌ Countries API error:', error);
//     res.setHeader('Content-Type', 'application/json');
//     return res.status(500).json({
//       error: 'Failed to fetch countries',
//       details: error.message
//     });
//   }
// }





// esims-countries.js
import { makeAuthenticatedRequest } from './esim-auth.js';

export default async function handler(req, res) {
  // ✅ Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📡 Making request to eSIM countries API...');

    const response = await makeAuthenticatedRequest(
      'https://esimcard.com/api/developer/reseller/packages/country',
      { method: 'GET' }
    );

    console.log('📥 Response status:', response.status);
    console.log('📥 Response content-type:', response.headers.get('content-type'));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ eSIM API error:', response.status, errorText.substring(0, 200));
      return res.status(response.status).json({
        error: `eSIM API error: ${response.status}`,
        details: errorText.substring(0, 500),
      });
    }

    // ✅ Validate content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const rawText = await response.text();
      console.error('❌ Countries API returned non-JSON:', rawText.substring(0, 200));
      return res.status(500).json({
        error: 'Countries API returned non-JSON response',
        contentType,
        rawResponse: rawText.substring(0, 500),
      });
    }

    const data = await response.json();
    console.log('📊 Parsed data keys:', Object.keys(data || {}));

    // ✅ Transform to frontend format
    let countries = [];
    if (data?.status && data?.data) {
      // Format: { status: true, data: { "Country Name": "ISO" } }
      countries = Object.entries(data.data).map(([name, isoCode], index) => ({
        id: (index + 1).toString(),
        name,
        iso: typeof isoCode === 'string' ? isoCode.toUpperCase() : isoCode,
        code_alpha3: '',
        flag_url: `https://flagcdn.com/w40/${typeof isoCode === 'string' ? isoCode.toLowerCase() : 'xx'}.png`,
        banner_url: '',
      }));
    } else if (Array.isArray(data)) {
      countries = data.map((country, index) => ({
        id: (country.id || index + 1).toString(),
        name: country.name || `Country ${index + 1}`,
        iso: country.iso || 'XX',
        code_alpha3: country.code_alpha3 || '',
        flag_url: country.flag_url || `https://flagcdn.com/w40/${(country.iso || 'xx').toLowerCase()}.png`,
        banner_url: country.banner_url || '',
      }));
    } else if (typeof data === 'object') {
      countries = Object.entries(data).map(([countryId, countryData]) => ({
        id: countryId,
        name: countryData?.iso?.name || countryData?.name || countryId,
        iso: countryData?.iso?.code?.toUpperCase() || countryData?.iso || 'XX',
        code_alpha3: countryData?.iso?.code_alpha3 || '',
        flag_url:
          countryData?.iso?.image_url ||
          countryData?.flag_url ||
          `https://flagcdn.com/w40/${(countryData?.iso?.code || 'xx').toLowerCase()}.png`,
        banner_url: countryData?.iso?.banner || countryData?.banner_url || '',
      }));
    }

    console.log('✅ Processed countries count:', countries.length);
    if (countries.length > 0) {
      console.log('🔍 First country:', countries[0]);
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(countries);
  } catch (error) {
    console.error('❌ Countries API error:', error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      error: 'Failed to fetch countries',
      details: error.message,
    });
  }
}
