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

  try {
    // Get Paystack secret key from environment variables
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    
    if (!secretKey) {
      return res.status(500).json({ error: 'Paystack secret key not configured' });
    }

    const response = await fetch('https://api.paystack.co/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch balance');
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Paystack Balance API Error:', error);
    res.status(500).json({ error: 'Failed to fetch balance from Paystack' });
  }
}