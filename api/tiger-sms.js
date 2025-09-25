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
    // Extract query parameters
    const { api_key, action, service, country, ref, status, id } = req.query;
    
    // Build the Tiger SMS API URL
    const baseUrl = 'https://api.tiger-sms.com/stubs/handler_api.php';
    const params = new URLSearchParams();
    
    if (api_key) params.append('api_key', api_key);
    if (action) params.append('action', action);
    if (service) params.append('service', service);
    if (country) params.append('country', country);
    if (ref) params.append('ref', ref);
    if (status) params.append('status', status);
    if (id) params.append('id', id);
    
    const url = `${baseUrl}?${params.toString()}`;
    
    console.log('Tiger SMS API Request:', url);
    
    const response = await fetch(url);
    const text = await response.text();
    
    console.log('Tiger SMS API Response:', text);
    
    res.status(200).send(text);
  } catch (error) {
    console.error('Tiger SMS API Error:', error);
    res.status(500).json({ error: 'Failed to fetch from Tiger SMS API' });
  }
}