const { getAccessToken } = require('./esim-auth.js');

const orderMappings = new Map();

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { packageId, packageType } = req.body;

  if (!packageId || !packageType) {
    return res.status(400).json({ error: 'packageId and packageType are required' });
  }

  try {
    console.log('🔐 Getting access token for purchase...');
    const accessToken = await getAccessToken();
    console.log('✅ Access token obtained for purchase');

    let url, requestBody;

    if (packageType === 'DATA-ONLY') {
      url = 'https://esimcard.com/api/developer/reseller/package/purchase?test=true';
      requestBody = { package_type_id: packageId };
    } else {
      url = 'https://esimcard.com/api/developer/reseller/package/date_voice_sms/purchase';
      requestBody = { package_type_id: packageId };
    }

    console.log('📡 Making purchase request to:', url);
    console.log('📡 Request body:', requestBody);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Purchase response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Purchase API error:', response.status, errorText);
      throw new Error(`API responded with ${response.status}: ${errorText}`);
    }

    const rawText = await response.text();
    console.log('📄 Raw purchase response (first 200 chars):', rawText.substring(0, 200));

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

    console.log('📊 Parsed purchase data:', JSON.stringify(data, null, 2));
    
    // Generate local order ID
    const localOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    orderMappings.set(localOrderId, {
      provider_purchase_id: data.purchase_id || data.id,
      created_at: new Date().toISOString(),
      package_id: packageId,
      package_type: packageType
    });
    
    res.status(200).json({ ...data, local_order_id: localOrderId });
  } catch (error) {
    console.error('❌ Purchase API error:', error);
    res.status(500).json({ error: 'Failed to purchase package', details: error.message });
  }
};

module.exports.orderMappings = orderMappings;