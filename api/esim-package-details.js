// GET /api/esim-package-details?packageId=XX
// Proxies to https://esimcard.com/api/developer/reseller/package/detail/:id

import { makeAuthenticatedRequest } from './esim-auth.js';

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

  const { packageId } = req.query;

  console.log('📋 PACKAGE DETAILS API: Received packageId:', packageId);

  if (!packageId) {
    return res.status(400).json({ error: 'packageId parameter is required' });
  }

  try {
    const fullUrl = `${ESIM_API_BASE}/package/detail/${packageId}`;
    console.log('📋 PACKAGE DETAILS API: Making request to:', fullUrl);
    
    const response = await makeAuthenticatedRequest(fullUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('eSIM package details API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to fetch package details',
        details: errorText 
      });
    }

    const data = await response.json();
    console.log('📋 PACKAGE DETAILS API: Response data:', data);
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Package details endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}