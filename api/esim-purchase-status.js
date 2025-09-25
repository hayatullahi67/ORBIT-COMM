// GET /api/esim-purchase-status?local_id=XXX
// Looks up local mapping and proxies to https://esimcard.com/api/developer/reseller/purchase/{purchase_id}

import { makeAuthenticatedRequest } from './esim-auth.js';
import { orderMappings } from './esim-purchase.js';

const ESIM_API_BASE = 'https://esimcard.com/api/developer/reseller';

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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { local_id } = req.query;

  if (!local_id) {
    return res.status(400).json({ error: 'Local order ID is required' });
  }

  try {
    // Look up the provider purchase ID
    const orderMapping = orderMappings.get(local_id);
    
    if (!orderMapping) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const response = await makeAuthenticatedRequest(
      `${ESIM_API_BASE}/purchase/${orderMapping.provider_purchase_id}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('eSIM purchase status API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to fetch purchase status',
        details: errorText 
      });
    }

    const data = await response.json();
    
    // Add local order info
    res.status(200).json({
      ...data,
      local_order_id: local_id,
      created_at: orderMapping.created_at
    });
  } catch (error) {
    console.error('Purchase status endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}