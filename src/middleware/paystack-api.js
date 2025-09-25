// Paystack API middleware for Vite dev server
const PAYSTACK_SECRET_KEY = 'sk_live_a8992fb56e44b6fd13d4615b3a2ae1d427c7718e';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Helper function to make authenticated requests to Paystack
async function makePaystackRequest(endpoint, options = {}) {
  const url = `${PAYSTACK_BASE_URL}${endpoint}`;
  
  console.log('📡 Making Paystack request:', { 
    method: options.method || 'GET', 
    url,
    body: options.body ? JSON.parse(options.body) : null
  });
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  console.log('📥 Paystack response:', { 
    status: response.status, 
    statusText: response.statusText,
    url 
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    console.error('❌ Paystack API error details:', errorData);
    throw new Error(`Paystack API error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  console.log('✅ Paystack response data:', data);
  return data;
}

// Create or get customer
async function getOrCreateCustomer(email, firstName = '', lastName = '') {
  try {
    // First, try to fetch existing customer by email
    console.log('🔍 Searching for existing customer:', email);
    
    try {
      const existingCustomer = await makePaystackRequest(`/customer/${encodeURIComponent(email)}`);
      if (existingCustomer.data) {
        console.log('✅ Found existing customer:', existingCustomer.data.customer_code);
        return existingCustomer.data;
      }
    } catch (error) {
      // Customer not found, will create new one
      console.log('🔍 Customer not found, will create new one');
    }

    // If no customer found, create new one
    console.log('🆕 Creating new customer for:', email);
    const newCustomer = await makePaystackRequest('/customer', {
      method: 'POST',
      body: JSON.stringify({
        email,
        first_name: firstName || email.split('@')[0],
        last_name: lastName || 'User'
      })
    });

    console.log('✅ Created new customer:', newCustomer.data.customer_code);
    return newCustomer.data;
  } catch (error) {
    console.error('❌ Error with customer:', error);
    throw error;
  }
}

export function paystackApiMiddleware() {
  return {
    name: 'paystack-api-middleware',
    configureServer(server) {
      
      // Get user balance endpoint
      server.middlewares.use('/api/paystack/balance', async (req, res) => {
        console.log('💰 Balance endpoint called');

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const { email } = JSON.parse(body);
            
            if (!email) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Email is required' }));
              return;
            }

            console.log('💰 Fetching balance for:', email);

            // Get or create customer
            const customer = await getOrCreateCustomer(email);
            
            // Get customer balance (Paystack doesn't have direct balance API, so we'll calculate from transactions)
            const transactions = await makePaystackRequest(`/transaction?customer=${customer.customer_code}&status=success`);
            
            // Calculate balance from successful transactions
            let balance = 0;
            if (transactions.data && transactions.data.length > 0) {
              balance = transactions.data.reduce((total, transaction) => {
                // Add deposits, subtract purchases
                if (transaction.metadata && transaction.metadata.type === 'wallet_funding') {
                  // Convert from NGN back to USD using original amount if available
                  const originalUsdAmount = transaction.metadata.original_usd_amount;
                  if (originalUsdAmount) {
                    return total + originalUsdAmount;
                  } else {
                    // Fallback: convert NGN to USD (approximate)
                    return total + (transaction.amount / 100 / 800); // NGN to USD conversion
                  }
                }
                return total;
              }, 0);
            }

            console.log('✅ Balance calculated:', balance);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              balance,
              currency: 'USD',
              customer_code: customer.customer_code 
            }));

          } catch (error) {
            console.error('❌ Balance endpoint error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
          }
        });
      });

      // Initialize payment endpoint
      server.middlewares.use('/api/paystack/initialize', async (req, res) => {
        console.log('🚀 Initialize payment endpoint called');

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const { amount, email, currency = 'NGN' } = JSON.parse(body);
            
            if (!amount || !email) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Amount and email are required' }));
              return;
            }

            console.log('🚀 Initializing payment:', { amount, email, currency });

            // Get or create customer
            const customer = await getOrCreateCustomer(email);

            // Convert USD to NGN (approximate rate: 1 USD = 800 NGN)
            const usdToNgnRate = 800;
            const amountInNgn = Math.round((amount / 100) * usdToNgnRate * 100); // Convert from kobo to USD, then to NGN kobo

            console.log('💱 Amount conversion:', { 
              originalAmount: amount, 
              usdAmount: amount / 100, 
              ngnAmount: amountInNgn / 100,
              ngnKobo: amountInNgn 
            });

            // Initialize transaction
            const transaction = await makePaystackRequest('/transaction/initialize', {
              method: 'POST',
              body: JSON.stringify({
                amount: amountInNgn, // Amount in kobo (NGN)
                email,
                currency: 'NGN', // Paystack live keys work with NGN
                customer: customer.customer_code,
                metadata: {
                  type: 'wallet_funding',
                  customer_code: customer.customer_code,
                  original_usd_amount: amount / 100
                },
                callback_url: `${req.headers.origin}/dashboard?payment=success`,
                cancel_url: `${req.headers.origin}/dashboard?payment=cancelled`
              })
            });

            console.log('✅ Payment initialized:', transaction.data.reference);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(transaction.data));

          } catch (error) {
            console.error('❌ Initialize payment error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
          }
        });
      });

      // Verify payment endpoint
      server.middlewares.use('/api/paystack/verify', async (req, res) => {
        console.log('✅ Verify payment endpoint called');

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const { reference } = JSON.parse(body);
            
            if (!reference) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Reference is required' }));
              return;
            }

            console.log('✅ Verifying payment:', reference);

            // Verify transaction
            const verification = await makePaystackRequest(`/transaction/verify/${reference}`);

            console.log('✅ Payment verification result:', verification.data.status);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(verification.data));

          } catch (error) {
            console.error('❌ Verify payment error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
          }
        });
      });

      // Get customer transactions endpoint
      server.middlewares.use('/api/paystack/transactions', async (req, res) => {
        console.log('📊 Transactions endpoint called');

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const { email } = JSON.parse(body);
            
            if (!email) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Email is required' }));
              return;
            }

            console.log('📊 Fetching transactions for:', email);

            // Get customer
            const customer = await getOrCreateCustomer(email);
            
            // Get customer transactions
            const transactions = await makePaystackRequest(`/transaction?customer=${customer.customer_code}`);

            console.log('✅ Transactions fetched:', transactions.data?.length || 0);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(transactions.data || []));

          } catch (error) {
            console.error('❌ Transactions endpoint error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
          }
        });
      });
    }
  };
}