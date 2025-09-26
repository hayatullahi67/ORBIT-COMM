module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.log('🧪 TEST: Simple test endpoint called');
  
  res.status(200).json({ 
    message: 'Test endpoint working!', 
    timestamp: new Date().toISOString(),
    method: req.method,
    headers: req.headers
  });
};