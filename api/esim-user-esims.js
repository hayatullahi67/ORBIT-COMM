const { makeAuthenticatedRequest } = require('./esim-auth.js');

const ESIM_API_BASE = 'https://esimcard.com/api/developer/reseller';

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    console.log('🚀 BACKEND: Fetching user eSIMs...');
    
    const response = await makeAuthenticatedRequest(`${ESIM_API_BASE}/esims`);
    
    console.log('📥 BACKEND: eSIM API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ BACKEND: eSIM API error:', response.status, errorText);
      
      // Try to parse as JSON for better error message
      let errorMessage = `eSIM API error: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        errorMessage = errorText || errorMessage;
      }
      
      res.status(response.status).json({ 
        error: errorMessage,
        status: response.status 
      });
      return;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('❌ BACKEND: Non-JSON response from eSIM API');
      res.status(500).json({ 
        error: 'eSIM API returned non-JSON response',
        contentType 
      });
      return;
    }

    const data = await response.json();
    console.log('📄 BACKEND: Raw eSIM API response:', JSON.stringify(data, null, 2));
    
    // Transform the data to match your frontend interface
    const transformedData = {
      esims: Array.isArray(data) ? data : (data.data || data.esims || [])
    };
    
    console.log('✅ BACKEND: Sending transformed data:', transformedData);
    
    // Set proper headers
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(transformedData);
    
  } catch (error) {
    console.error('❌ BACKEND: Error fetching user eSIMs:', error);
    
    // Send proper JSON error response
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ 
      error: 'Failed to fetch user eSIMs', 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};