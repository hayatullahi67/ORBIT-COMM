// Vite middleware for handling eSIM API routes

const ESIM_API_BASE = 'https://esimcard.com/api/developer/reseller';

// Cache for access token
let cachedToken = null;
let tokenExpiry = null;

// Function to get access token
async function getAccessToken() {
  console.log('🔐 Getting access token...');

  // Check if we have a valid cached token
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('✅ Using cached token');
    return cachedToken;
  }

  // Login to get new token
  try {
    console.log('🚀 Logging in to eSIM API...');
    const loginUrl = `${ESIM_API_BASE}/login`;
    console.log('📡 Login URL:', loginUrl);

    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'johnomodiagbe44@gmail.com',
        password: '247sim.netqp@#$'
      })
    });

    console.log('📥 Login response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Login failed:', response.status, errorText);
      throw new Error(`Login failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Login successful! Token received:', data.access_token ? 'YES' : 'NO');
    console.log('📄 Full login response:', data);

    cachedToken = data.access_token;

    // Cache for 50 minutes (assuming 1 hour expiry)
    tokenExpiry = Date.now() + (50 * 60 * 1000);

    return cachedToken;
  } catch (error) {
    console.error('❌ eSIM API login error:', error);
    throw error;
  }
}

// Function to make authenticated requests
async function makeAuthenticatedRequest(url, options = {}) {
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
}

export function esimApiMiddleware() {
  return {
    name: 'esim-api-middleware',
    configureServer(server) {
      // Countries endpoint
      server.middlewares.use('/api/esim/countries', async (req, res) => {
        console.log('🌍 Countries endpoint called');

        if (req.method !== 'GET') {
          console.log('❌ Wrong method:', req.method);
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        try {
          const countriesUrl = `${ESIM_API_BASE}/packages/country`;
          console.log('📡 Fetching countries from:', countriesUrl);

          const response = await makeAuthenticatedRequest(countriesUrl);
          console.log('📥 Countries response status:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ eSIM countries API error:', response.status, errorText);
            res.statusCode = response.status;
            res.end(JSON.stringify({ error: 'Failed to fetch countries', details: errorText }));
            return;
          }

          const data = await response.json();
          console.log('📄 RAW COUNTRIES DATA FROM API:', JSON.stringify(data, null, 2));

          // Handle the actual API response format: {status: true, data: {country_name: iso_code}}
          let countries = [];
          
          if (data.status && data.data) {
            // The data.data contains the countries object
            countries = Object.entries(data.data).map(([name, iso]) => ({ name, iso }));
          } else if (typeof data === 'object' && !Array.isArray(data)) {
            // Fallback: if it's a direct object with countries
            countries = Object.entries(data).map(([name, iso]) => ({ name, iso }));
          } else {
            console.error('❌ Unexpected countries data format:', data);
          }
          
          console.log('✅ PROCESSED COUNTRIES COUNT:', countries.length);
          console.log('🔍 FIRST 5 COUNTRIES:', JSON.stringify(countries.slice(0, 5), null, 2));
          console.log('🌍 SENDING COUNTRIES TO FRONTEND:', JSON.stringify(countries, null, 2));

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(countries));
        } catch (error) {
          console.error('❌ Countries endpoint error:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
        }
      });

      // Packages endpoint
      server.middlewares.use('/api/esim/packages', async (req, res) => {
        console.log('📦 Packages endpoint called');

        if (req.method !== 'GET') {
          console.log('❌ Wrong method:', req.method);
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        const url = new URL(req.url, `http://${req.headers.host}`);
        const countryId = url.searchParams.get('countryId');
        const packageType = url.searchParams.get('packageType');
        
        console.log('📦 PACKAGES API: Received countryId:', countryId);
        console.log('📦 PACKAGES API: Received packageType:', packageType);

        if (!countryId) {
          console.log('❌ No countryId parameter provided');
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'countryId parameter is required' }));
          return;
        }

        if (!packageType) {
          console.log('❌ No packageType parameter provided');
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'packageType parameter is required (DATA-ONLY or DATA-VOICE-SMS)' }));
          return;
        }

        // Validate package type
        if (!['DATA-ONLY', 'DATA-VOICE-SMS'].includes(packageType)) {
          console.log('❌ Invalid packageType:', packageType);
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'packageType must be DATA-ONLY or DATA-VOICE-SMS' }));
          return;
        }

        try {
          const packagesUrl = `${ESIM_API_BASE}/packages/country/${countryId}/${packageType}`;
          console.log('📦 PACKAGES API: Making request to:', packagesUrl);

          const response = await makeAuthenticatedRequest(packagesUrl);
          console.log('📥 Packages response status:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ eSIM packages API error:', response.status, errorText);
            res.statusCode = response.status;
            res.end(JSON.stringify({ error: 'Failed to fetch packages', details: errorText }));
            return;
          }

          const data = await response.json();
          console.log('📦 PACKAGES API: Response data:', data);
          console.log('📦 PACKAGES API: Number of packages:', Array.isArray(data) ? data.length : 'Not an array');
          
          // Handle the API response format - extract the actual packages data
          let packages = [];
          
          if (data.status && data.data) {
            packages = Array.isArray(data.data) ? data.data : [];
          } else if (Array.isArray(data)) {
            packages = data;
          } else {
            console.error('❌ Unexpected packages data format:', data);
          }
          
          console.log('✅ PROCESSED PACKAGES COUNT:', packages.length);
          console.log('🔍 FIRST 3 PACKAGES:', JSON.stringify(packages.slice(0, 3), null, 2));

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(packages));
        } catch (error) {
          console.error('❌ Packages endpoint error:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
        }
      });

      // Package Details endpoint
      server.middlewares.use('/api/esim/package-details', async (req, res) => {
        console.log('📋 Package Details endpoint called');

        if (req.method !== 'GET') {
          console.log('❌ Wrong method:', req.method);
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        const url = new URL(req.url, `http://${req.headers.host}`);
        const packageId = url.searchParams.get('packageId');
        
        console.log('📋 PACKAGE DETAILS API: Received packageId:', packageId);

        if (!packageId) {
          console.log('❌ No packageId parameter provided');
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'packageId parameter is required' }));
          return;
        }

        try {
          const detailsUrl = `${ESIM_API_BASE}/package/detail/${packageId}`;
          console.log('📋 PACKAGE DETAILS API: Making request to:', detailsUrl);

          const response = await makeAuthenticatedRequest(detailsUrl);
          console.log('📥 Package details response status:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ eSIM package details API error:', response.status, errorText);
            res.statusCode = response.status;
            res.end(JSON.stringify({ error: 'Failed to fetch package details', details: errorText }));
            return;
          }

          const data = await response.json();
          console.log('📋 PACKAGE DETAILS API: Response data:', data);

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        } catch (error) {
          console.error('❌ Package details endpoint error:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
        }
      });

      // Purchase Package endpoint
      server.middlewares.use('/api/esim/purchase', async (req, res) => {
        console.log('💳 Purchase Package endpoint called');

        if (req.method !== 'POST') {
          console.log('❌ Wrong method:', req.method);
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const { packageId, packageType } = JSON.parse(body);
            
            console.log('💳 PURCHASE API: Received packageId:', packageId);
            console.log('💳 PURCHASE API: Received packageType:', packageType);

            if (!packageId) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'packageId is required' }));
              return;
            }

            if (!packageType) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'packageType is required (DATA-ONLY or DATA-VOICE-SMS)' }));
              return;
            }

            // Validate package type
            if (!['DATA-ONLY', 'DATA-VOICE-SMS'].includes(packageType)) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'packageType must be DATA-ONLY or DATA-VOICE-SMS' }));
              return;
            }

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
              res.statusCode = response.status;
              res.end(JSON.stringify({ error: 'Failed to purchase package', details: errorText }));
              return;
            }

            const data = await response.json();
            console.log('💳 PURCHASE API: Response data:', data);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } catch (error) {
            console.error('❌ Purchase endpoint error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
          }
        });
      });

      // User eSIMs endpoint - this would typically query your database
      server.middlewares.use('/api/user/esims', async (req, res) => {
        console.log('👤 User eSIMs endpoint called');

        if (req.method !== 'GET') {
          console.log('❌ Wrong method:', req.method);
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        try {
          console.log('📄 Returning empty eSIMs array (no user system integrated yet)');

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ esims: [] }));
        } catch (error) {
          console.error('❌ User eSIMs endpoint error:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
        }
      });
    }
  };
}