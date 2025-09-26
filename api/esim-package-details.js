const { getAccessToken } = require('./esim-auth.js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { packageId } = req.query;

  if (!packageId) {
    return res.status(400).json({ error: 'packageId is required' });
  }

  try {
    console.log('🔐 Getting access token for package details...');
    const accessToken = await getAccessToken();
    console.log('✅ Access token obtained for package details');

    const url = `https://esimcard.com/api/developer/reseller/package/detail/${packageId}`;
    console.log('📡 Making request to:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('📥 Package details response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Package details API error:', response.status, errorText);
      throw new Error(`API responded with ${response.status}: ${errorText}`);
    }

    const rawText = await response.text();
    console.log('📄 Raw package details response (first 200 chars):', rawText.substring(0, 200));

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return res.status(500).json({ 
        error: 'Invalid JSON response from eSIM API',
        rawResponse: rawText.substring(0, 500)
      });
    }

    console.log('📊 Parsed package details data:', JSON.stringify(data, null, 2));
    res.status(200).json(data);
  } catch (error) {
    console.error('❌ Package details API error:', error);
    res.status(500).json({ error: 'Failed to fetch package details', details: error.message });
  }
};