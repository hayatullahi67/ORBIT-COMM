module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.log('🧪 TEST: No-auth test endpoint called');
  
  try {
    // Test external API call without authentication
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    const data = await response.json();
    
    res.status(200).json({ 
      message: 'External API call successful!', 
      testData: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ TEST: External API call failed:', error);
    res.status(500).json({ 
      error: 'External API call failed', 
      details: error.message 
    });
  }
};