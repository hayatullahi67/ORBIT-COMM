// GET /api/user/esims
// Returns user's purchased eSIMs (mock data for now, integrate with your user system)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // TODO: Get user ID from authentication token
    // TODO: Query database for user's eSIM purchases
    // For now, return mock data structure that matches the frontend expectations
    
    const mockEsims = [
      {
        id: 1,
        name: "Europe 30-Day",
        plan: "Premium Europe",
        country: "Multi-Country",
        region: "Europe",
        dataTotal: "10GB",
        dataUsed: "3.2GB",
        dataRemaining: "6.8GB",
        status: "Active",
        expires: "2024-11-15",
        activated: "2024-10-16",
        speed: "5G",
        countries: ["France", "Germany", "Italy", "Spain", "Netherlands"],
        price: "$29.99"
      },
      {
        id: 2,
        name: "Global Traveler",
        plan: "Worldwide Basic",
        country: "Global",
        region: "Worldwide",
        dataTotal: "5GB",
        dataUsed: "4.8GB",
        dataRemaining: "0.2GB",
        status: "Expiring",
        expires: "2024-10-03",
        activated: "2024-09-03",
        speed: "4G",
        countries: ["150+ Countries"],
        price: "$19.99"
      }
    ];

    res.status(200).json({ esims: mockEsims });
  } catch (error) {
    console.error('User eSIMs endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}