// vite.config.ts
import { defineConfig } from "file:///C:/Users/user/Desktop/orbit-comm/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/user/Desktop/orbit-comm/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/user/Desktop/orbit-comm/node_modules/lovable-tagger/dist/index.js";

// src/middleware/esim-api.js
var ESIM_API_BASE = "https://esimcard.com/api/developer/reseller";
var cachedToken = null;
var tokenExpiry = null;
async function getAccessToken() {
  console.log("\u{1F510} Getting access token...");
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log("\u2705 Using cached token");
    return cachedToken;
  }
  try {
    console.log("\u{1F680} Logging in to eSIM API...");
    const loginUrl = `${ESIM_API_BASE}/login`;
    console.log("\u{1F4E1} Login URL:", loginUrl);
    const response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        email: "johnomodiagbe44@gmail.com",
        password: "247sim.netqp@#$"
      })
    });
    console.log("\u{1F4E5} Login response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("\u274C Login failed:", response.status, errorText);
      throw new Error(`Login failed: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    console.log("\u2705 Login successful! Token received:", data.access_token ? "YES" : "NO");
    console.log("\u{1F4C4} Full login response:", data);
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + 50 * 60 * 1e3;
    return cachedToken;
  } catch (error) {
    console.error("\u274C eSIM API login error:", error);
    throw error;
  }
}
async function makeAuthenticatedRequest(url, options = {}) {
  const token = await getAccessToken();
  return fetch(url, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...options.headers
    }
  });
}
function esimApiMiddleware() {
  return {
    name: "esim-api-middleware",
    configureServer(server) {
      server.middlewares.use("/api/esim/countries", async (req, res) => {
        console.log("\u{1F30D} Countries endpoint called");
        if (req.method !== "GET") {
          console.log("\u274C Wrong method:", req.method);
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        try {
          const countriesUrl = `${ESIM_API_BASE}/packages/country`;
          console.log("\u{1F4E1} Fetching countries from:", countriesUrl);
          const response = await makeAuthenticatedRequest(countriesUrl);
          console.log("\u{1F4E5} Countries response status:", response.status);
          if (!response.ok) {
            const errorText = await response.text();
            console.error("\u274C eSIM countries API error:", response.status, errorText);
            res.statusCode = response.status;
            res.end(JSON.stringify({ error: "Failed to fetch countries", details: errorText }));
            return;
          }
          const data = await response.json();
          console.log("\u{1F4C4} RAW COUNTRIES DATA FROM API:", JSON.stringify(data, null, 2));
          let countries = [];
          if (data.status && data.data) {
            countries = Object.entries(data.data).map(([name, iso]) => ({ name, iso }));
          } else if (typeof data === "object" && !Array.isArray(data)) {
            countries = Object.entries(data).map(([name, iso]) => ({ name, iso }));
          } else {
            console.error("\u274C Unexpected countries data format:", data);
          }
          console.log("\u2705 PROCESSED COUNTRIES COUNT:", countries.length);
          console.log("\u{1F50D} FIRST 5 COUNTRIES:", JSON.stringify(countries.slice(0, 5), null, 2));
          console.log("\u{1F30D} SENDING COUNTRIES TO FRONTEND:", JSON.stringify(countries, null, 2));
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(countries));
        } catch (error) {
          console.error("\u274C Countries endpoint error:", error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Internal server error", details: error.message }));
        }
      });
      server.middlewares.use("/api/esim/packages", async (req, res) => {
        console.log("\u{1F4E6} Packages endpoint called");
        if (req.method !== "GET") {
          console.log("\u274C Wrong method:", req.method);
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        const url = new URL(req.url, `http://${req.headers.host}`);
        const countryId = url.searchParams.get("countryId");
        const packageType = url.searchParams.get("packageType");
        console.log("\u{1F4E6} PACKAGES API: Received countryId:", countryId);
        console.log("\u{1F4E6} PACKAGES API: Received packageType:", packageType);
        if (!countryId) {
          console.log("\u274C No countryId parameter provided");
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "countryId parameter is required" }));
          return;
        }
        if (!packageType) {
          console.log("\u274C No packageType parameter provided");
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "packageType parameter is required (DATA-ONLY or DATA-VOICE-SMS)" }));
          return;
        }
        if (!["DATA-ONLY", "DATA-VOICE-SMS"].includes(packageType)) {
          console.log("\u274C Invalid packageType:", packageType);
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "packageType must be DATA-ONLY or DATA-VOICE-SMS" }));
          return;
        }
        try {
          const packagesUrl = `${ESIM_API_BASE}/packages/country/${countryId}/${packageType}`;
          console.log("\u{1F4E6} PACKAGES API: Making request to:", packagesUrl);
          const response = await makeAuthenticatedRequest(packagesUrl);
          console.log("\u{1F4E5} Packages response status:", response.status);
          if (!response.ok) {
            const errorText = await response.text();
            console.error("\u274C eSIM packages API error:", response.status, errorText);
            res.statusCode = response.status;
            res.end(JSON.stringify({ error: "Failed to fetch packages", details: errorText }));
            return;
          }
          const data = await response.json();
          console.log("\u{1F4E6} PACKAGES API: Response data:", data);
          console.log("\u{1F4E6} PACKAGES API: Number of packages:", Array.isArray(data) ? data.length : "Not an array");
          let packages = [];
          if (data.status && data.data) {
            packages = Array.isArray(data.data) ? data.data : [];
          } else if (Array.isArray(data)) {
            packages = data;
          } else {
            console.error("\u274C Unexpected packages data format:", data);
          }
          console.log("\u2705 PROCESSED PACKAGES COUNT:", packages.length);
          console.log("\u{1F50D} FIRST 3 PACKAGES:", JSON.stringify(packages.slice(0, 3), null, 2));
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(packages));
        } catch (error) {
          console.error("\u274C Packages endpoint error:", error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Internal server error", details: error.message }));
        }
      });
      server.middlewares.use("/api/esim/package-details", async (req, res) => {
        console.log("\u{1F4CB} Package Details endpoint called");
        if (req.method !== "GET") {
          console.log("\u274C Wrong method:", req.method);
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        const url = new URL(req.url, `http://${req.headers.host}`);
        const packageId = url.searchParams.get("packageId");
        console.log("\u{1F4CB} PACKAGE DETAILS API: Received packageId:", packageId);
        if (!packageId) {
          console.log("\u274C No packageId parameter provided");
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "packageId parameter is required" }));
          return;
        }
        try {
          const detailsUrl = `${ESIM_API_BASE}/package/detail/${packageId}`;
          console.log("\u{1F4CB} PACKAGE DETAILS API: Making request to:", detailsUrl);
          const response = await makeAuthenticatedRequest(detailsUrl);
          console.log("\u{1F4E5} Package details response status:", response.status);
          if (!response.ok) {
            const errorText = await response.text();
            console.error("\u274C eSIM package details API error:", response.status, errorText);
            res.statusCode = response.status;
            res.end(JSON.stringify({ error: "Failed to fetch package details", details: errorText }));
            return;
          }
          const data = await response.json();
          console.log("\u{1F4CB} PACKAGE DETAILS API: Response data:", data);
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(data));
        } catch (error) {
          console.error("\u274C Package details endpoint error:", error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Internal server error", details: error.message }));
        }
      });
      server.middlewares.use("/api/esim/purchase", async (req, res) => {
        console.log("\u{1F4B3} Purchase Package endpoint called");
        if (req.method !== "POST") {
          console.log("\u274C Wrong method:", req.method);
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", async () => {
          try {
            const { packageId, packageType } = JSON.parse(body);
            console.log("\u{1F4B3} PURCHASE API: Received packageId:", packageId);
            console.log("\u{1F4B3} PURCHASE API: Received packageType:", packageType);
            if (!packageId) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "packageId is required" }));
              return;
            }
            if (!packageType) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "packageType is required (DATA-ONLY or DATA-VOICE-SMS)" }));
              return;
            }
            if (!["DATA-ONLY", "DATA-VOICE-SMS"].includes(packageType)) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "packageType must be DATA-ONLY or DATA-VOICE-SMS" }));
              return;
            }
            let purchaseUrl;
            let requestBody;
            if (packageType === "DATA-ONLY") {
              purchaseUrl = `${ESIM_API_BASE}/package/purchase?test=true`;
              requestBody = {
                package_type_id: packageId
              };
            } else {
              purchaseUrl = `${ESIM_API_BASE}/package/date_voice_sms/purchase`;
              requestBody = {
                package_type_id: packageId
              };
            }
            console.log("\u{1F4B3} PURCHASE API: Making request to:", purchaseUrl);
            console.log("\u{1F4B3} PURCHASE API: Request body:", requestBody);
            const response = await makeAuthenticatedRequest(purchaseUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(requestBody)
            });
            console.log("\u{1F4E5} Purchase response status:", response.status);
            if (!response.ok) {
              const errorText = await response.text();
              console.error("\u274C eSIM purchase API error:", response.status, errorText);
              res.statusCode = response.status;
              res.end(JSON.stringify({ error: "Failed to purchase package", details: errorText }));
              return;
            }
            const data = await response.json();
            console.log("\u{1F4B3} PURCHASE API: Response data:", data);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(data));
          } catch (error) {
            console.error("\u274C Purchase endpoint error:", error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "Internal server error", details: error.message }));
          }
        });
      });
      server.middlewares.use("/api/user/esims", async (req, res) => {
        console.log("\u{1F464} User eSIMs endpoint called");
        if (req.method !== "GET") {
          console.log("\u274C Wrong method:", req.method);
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        try {
          console.log("\u{1F4C4} Returning empty eSIMs array (no user system integrated yet)");
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ esims: [] }));
        } catch (error) {
          console.error("\u274C User eSIMs endpoint error:", error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Internal server error", details: error.message }));
        }
      });
    }
  };
}

// src/middleware/paystack-api.js
var PAYSTACK_SECRET_KEY = "sk_live_a8992fb56e44b6fd13d4615b3a2ae1d427c7718e";
var PAYSTACK_BASE_URL = "https://api.paystack.co";
async function makePaystackRequest(endpoint, options = {}) {
  const url = `${PAYSTACK_BASE_URL}${endpoint}`;
  console.log("\u{1F4E1} Making Paystack request:", {
    method: options.method || "GET",
    url,
    body: options.body ? JSON.parse(options.body) : null
  });
  const response = await fetch(url, {
    ...options,
    headers: {
      "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...options.headers
    }
  });
  console.log("\u{1F4E5} Paystack response:", {
    status: response.status,
    statusText: response.statusText,
    url
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    console.error("\u274C Paystack API error details:", errorData);
    throw new Error(`Paystack API error: ${response.status} - ${JSON.stringify(errorData)}`);
  }
  const data = await response.json();
  console.log("\u2705 Paystack response data:", data);
  return data;
}
async function getOrCreateCustomer(email, firstName = "", lastName = "") {
  try {
    console.log("\u{1F50D} Searching for existing customer:", email);
    try {
      const existingCustomer = await makePaystackRequest(`/customer/${encodeURIComponent(email)}`);
      if (existingCustomer.data) {
        console.log("\u2705 Found existing customer:", existingCustomer.data.customer_code);
        return existingCustomer.data;
      }
    } catch (error) {
      console.log("\u{1F50D} Customer not found, will create new one");
    }
    console.log("\u{1F195} Creating new customer for:", email);
    const newCustomer = await makePaystackRequest("/customer", {
      method: "POST",
      body: JSON.stringify({
        email,
        first_name: firstName || email.split("@")[0],
        last_name: lastName || "User"
      })
    });
    console.log("\u2705 Created new customer:", newCustomer.data.customer_code);
    return newCustomer.data;
  } catch (error) {
    console.error("\u274C Error with customer:", error);
    throw error;
  }
}
function paystackApiMiddleware() {
  return {
    name: "paystack-api-middleware",
    configureServer(server) {
      server.middlewares.use("/api/paystack/balance", async (req, res) => {
        console.log("\u{1F4B0} Balance endpoint called");
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", async () => {
          try {
            const { email } = JSON.parse(body);
            if (!email) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "Email is required" }));
              return;
            }
            console.log("\u{1F4B0} Fetching balance for:", email);
            const customer = await getOrCreateCustomer(email);
            const transactions = await makePaystackRequest(`/transaction?customer=${customer.customer_code}&status=success`);
            let balance = 0;
            if (transactions.data && transactions.data.length > 0) {
              balance = transactions.data.reduce((total, transaction) => {
                if (transaction.metadata && transaction.metadata.type === "wallet_funding") {
                  const originalUsdAmount = transaction.metadata.original_usd_amount;
                  if (originalUsdAmount) {
                    return total + originalUsdAmount;
                  } else {
                    return total + transaction.amount / 100 / 800;
                  }
                }
                return total;
              }, 0);
            }
            console.log("\u2705 Balance calculated:", balance);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({
              balance,
              currency: "USD",
              customer_code: customer.customer_code
            }));
          } catch (error) {
            console.error("\u274C Balance endpoint error:", error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "Internal server error", details: error.message }));
          }
        });
      });
      server.middlewares.use("/api/paystack/initialize", async (req, res) => {
        console.log("\u{1F680} Initialize payment endpoint called");
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", async () => {
          try {
            const { amount, email, currency = "NGN" } = JSON.parse(body);
            if (!amount || !email) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "Amount and email are required" }));
              return;
            }
            console.log("\u{1F680} Initializing payment:", { amount, email, currency });
            const customer = await getOrCreateCustomer(email);
            const usdToNgnRate = 800;
            const amountInNgn = Math.round(amount / 100 * usdToNgnRate * 100);
            console.log("\u{1F4B1} Amount conversion:", {
              originalAmount: amount,
              usdAmount: amount / 100,
              ngnAmount: amountInNgn / 100,
              ngnKobo: amountInNgn
            });
            const transaction = await makePaystackRequest("/transaction/initialize", {
              method: "POST",
              body: JSON.stringify({
                amount: amountInNgn,
                // Amount in kobo (NGN)
                email,
                currency: "NGN",
                // Paystack live keys work with NGN
                customer: customer.customer_code,
                metadata: {
                  type: "wallet_funding",
                  customer_code: customer.customer_code,
                  original_usd_amount: amount / 100
                },
                callback_url: `${req.headers.origin}/dashboard?payment=success`,
                cancel_url: `${req.headers.origin}/dashboard?payment=cancelled`
              })
            });
            console.log("\u2705 Payment initialized:", transaction.data.reference);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(transaction.data));
          } catch (error) {
            console.error("\u274C Initialize payment error:", error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "Internal server error", details: error.message }));
          }
        });
      });
      server.middlewares.use("/api/paystack/verify", async (req, res) => {
        console.log("\u2705 Verify payment endpoint called");
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", async () => {
          try {
            const { reference } = JSON.parse(body);
            if (!reference) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "Reference is required" }));
              return;
            }
            console.log("\u2705 Verifying payment:", reference);
            const verification = await makePaystackRequest(`/transaction/verify/${reference}`);
            console.log("\u2705 Payment verification result:", verification.data.status);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(verification.data));
          } catch (error) {
            console.error("\u274C Verify payment error:", error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "Internal server error", details: error.message }));
          }
        });
      });
      server.middlewares.use("/api/paystack/transactions", async (req, res) => {
        console.log("\u{1F4CA} Transactions endpoint called");
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", async () => {
          try {
            const { email } = JSON.parse(body);
            if (!email) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "Email is required" }));
              return;
            }
            console.log("\u{1F4CA} Fetching transactions for:", email);
            const customer = await getOrCreateCustomer(email);
            const transactions = await makePaystackRequest(`/transaction?customer=${customer.customer_code}`);
            console.log("\u2705 Transactions fetched:", transactions.data?.length || 0);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(transactions.data || []));
          } catch (error) {
            console.error("\u274C Transactions endpoint error:", error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "Internal server error", details: error.message }));
          }
        });
      });
    }
  };
}

// vite.config.ts
var __vite_injected_original_dirname = "C:\\Users\\user\\Desktop\\orbit-comm";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api/tiger-sms": {
        target: "https://api.tiger-sms.com",
        changeOrigin: true,
        rewrite: (path2) => path2.replace(/^\/api\/tiger-sms/, "/stubs/handler_api.php")
      }
    }
  },
  plugins: [
    react(),
    esimApiMiddleware(),
    paystackApiMiddleware(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL21pZGRsZXdhcmUvZXNpbS1hcGkuanMiLCAic3JjL21pZGRsZXdhcmUvcGF5c3RhY2stYXBpLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcdXNlclxcXFxEZXNrdG9wXFxcXG9yYml0LWNvbW1cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHVzZXJcXFxcRGVza3RvcFxcXFxvcmJpdC1jb21tXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy91c2VyL0Rlc2t0b3Avb3JiaXQtY29tbS92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IGxvYWRFbnYgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcbmltcG9ydCB7IGVzaW1BcGlNaWRkbGV3YXJlIH0gZnJvbSBcIi4vc3JjL21pZGRsZXdhcmUvZXNpbS1hcGkuanNcIjtcclxuaW1wb3J0IHsgcGF5c3RhY2tBcGlNaWRkbGV3YXJlIH0gZnJvbSBcIi4vc3JjL21pZGRsZXdhcmUvcGF5c3RhY2stYXBpLmpzXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCI6OlwiLFxyXG4gICAgcG9ydDogODA4MCxcclxuICAgIHByb3h5OiB7XHJcbiAgICAgIFwiL2FwaS90aWdlci1zbXNcIjoge1xyXG4gICAgICAgIHRhcmdldDogXCJodHRwczovL2FwaS50aWdlci1zbXMuY29tXCIsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIHJld3JpdGU6IHBhdGggPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpXFwvdGlnZXItc21zLywgXCIvc3R1YnMvaGFuZGxlcl9hcGkucGhwXCIpLFxyXG4gICAgICB9LFxyXG5cclxuICAgIH0sXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgZXNpbUFwaU1pZGRsZXdhcmUoKSxcclxuICAgIHBheXN0YWNrQXBpTWlkZGxld2FyZSgpLFxyXG4gICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJlxyXG4gICAgY29tcG9uZW50VGFnZ2VyKCksXHJcbiAgXS5maWx0ZXIoQm9vbGVhbiksXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0pKTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx1c2VyXFxcXERlc2t0b3BcXFxcb3JiaXQtY29tbVxcXFxzcmNcXFxcbWlkZGxld2FyZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcdXNlclxcXFxEZXNrdG9wXFxcXG9yYml0LWNvbW1cXFxcc3JjXFxcXG1pZGRsZXdhcmVcXFxcZXNpbS1hcGkuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3VzZXIvRGVza3RvcC9vcmJpdC1jb21tL3NyYy9taWRkbGV3YXJlL2VzaW0tYXBpLmpzXCI7Ly8gVml0ZSBtaWRkbGV3YXJlIGZvciBoYW5kbGluZyBlU0lNIEFQSSByb3V0ZXNcclxuXHJcbmNvbnN0IEVTSU1fQVBJX0JBU0UgPSAnaHR0cHM6Ly9lc2ltY2FyZC5jb20vYXBpL2RldmVsb3Blci9yZXNlbGxlcic7XHJcblxyXG4vLyBDYWNoZSBmb3IgYWNjZXNzIHRva2VuXHJcbmxldCBjYWNoZWRUb2tlbiA9IG51bGw7XHJcbmxldCB0b2tlbkV4cGlyeSA9IG51bGw7XHJcblxyXG4vLyBGdW5jdGlvbiB0byBnZXQgYWNjZXNzIHRva2VuXHJcbmFzeW5jIGZ1bmN0aW9uIGdldEFjY2Vzc1Rva2VuKCkge1xyXG4gIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMTAgR2V0dGluZyBhY2Nlc3MgdG9rZW4uLi4nKTtcclxuXHJcbiAgLy8gQ2hlY2sgaWYgd2UgaGF2ZSBhIHZhbGlkIGNhY2hlZCB0b2tlblxyXG4gIGlmIChjYWNoZWRUb2tlbiAmJiB0b2tlbkV4cGlyeSAmJiBEYXRlLm5vdygpIDwgdG9rZW5FeHBpcnkpIHtcclxuICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgVXNpbmcgY2FjaGVkIHRva2VuJyk7XHJcbiAgICByZXR1cm4gY2FjaGVkVG9rZW47XHJcbiAgfVxyXG5cclxuICAvLyBMb2dpbiB0byBnZXQgbmV3IHRva2VuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURFODAgTG9nZ2luZyBpbiB0byBlU0lNIEFQSS4uLicpO1xyXG4gICAgY29uc3QgbG9naW5VcmwgPSBgJHtFU0lNX0FQSV9CQVNFfS9sb2dpbmA7XHJcbiAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0UxIExvZ2luIFVSTDonLCBsb2dpblVybCk7XHJcblxyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChsb2dpblVybCwge1xyXG4gICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJ1xyXG4gICAgICB9LFxyXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgZW1haWw6ICdqb2hub21vZGlhZ2JlNDRAZ21haWwuY29tJyxcclxuICAgICAgICBwYXNzd29yZDogJzI0N3NpbS5uZXRxcEAjJCdcclxuICAgICAgfSlcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDRTUgTG9naW4gcmVzcG9uc2Ugc3RhdHVzOicsIHJlc3BvbnNlLnN0YXR1cyk7XHJcblxyXG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICBjb25zdCBlcnJvclRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBMb2dpbiBmYWlsZWQ6JywgcmVzcG9uc2Uuc3RhdHVzLCBlcnJvclRleHQpO1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYExvZ2luIGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXN9IC0gJHtlcnJvclRleHR9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgTG9naW4gc3VjY2Vzc2Z1bCEgVG9rZW4gcmVjZWl2ZWQ6JywgZGF0YS5hY2Nlc3NfdG9rZW4gPyAnWUVTJyA6ICdOTycpO1xyXG4gICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENDNCBGdWxsIGxvZ2luIHJlc3BvbnNlOicsIGRhdGEpO1xyXG5cclxuICAgIGNhY2hlZFRva2VuID0gZGF0YS5hY2Nlc3NfdG9rZW47XHJcblxyXG4gICAgLy8gQ2FjaGUgZm9yIDUwIG1pbnV0ZXMgKGFzc3VtaW5nIDEgaG91ciBleHBpcnkpXHJcbiAgICB0b2tlbkV4cGlyeSA9IERhdGUubm93KCkgKyAoNTAgKiA2MCAqIDEwMDApO1xyXG5cclxuICAgIHJldHVybiBjYWNoZWRUb2tlbjtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignXHUyNzRDIGVTSU0gQVBJIGxvZ2luIGVycm9yOicsIGVycm9yKTtcclxuICAgIHRocm93IGVycm9yO1xyXG4gIH1cclxufVxyXG5cclxuLy8gRnVuY3Rpb24gdG8gbWFrZSBhdXRoZW50aWNhdGVkIHJlcXVlc3RzXHJcbmFzeW5jIGZ1bmN0aW9uIG1ha2VBdXRoZW50aWNhdGVkUmVxdWVzdCh1cmwsIG9wdGlvbnMgPSB7fSkge1xyXG4gIGNvbnN0IHRva2VuID0gYXdhaXQgZ2V0QWNjZXNzVG9rZW4oKTtcclxuXHJcbiAgcmV0dXJuIGZldGNoKHVybCwge1xyXG4gICAgLi4ub3B0aW9ucyxcclxuICAgIGhlYWRlcnM6IHtcclxuICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7dG9rZW59YCxcclxuICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzXHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBlc2ltQXBpTWlkZGxld2FyZSgpIHtcclxuICByZXR1cm4ge1xyXG4gICAgbmFtZTogJ2VzaW0tYXBpLW1pZGRsZXdhcmUnLFxyXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xyXG4gICAgICAvLyBDb3VudHJpZXMgZW5kcG9pbnRcclxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaS9lc2ltL2NvdW50cmllcycsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0NcdURGMEQgQ291bnRyaWVzIGVuZHBvaW50IGNhbGxlZCcpO1xyXG5cclxuICAgICAgICBpZiAocmVxLm1ldGhvZCAhPT0gJ0dFVCcpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3NEMgV3JvbmcgbWV0aG9kOicsIHJlcS5tZXRob2QpO1xyXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDU7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdNZXRob2Qgbm90IGFsbG93ZWQnIH0pKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zdCBjb3VudHJpZXNVcmwgPSBgJHtFU0lNX0FQSV9CQVNFfS9wYWNrYWdlcy9jb3VudHJ5YDtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDRTEgRmV0Y2hpbmcgY291bnRyaWVzIGZyb206JywgY291bnRyaWVzVXJsKTtcclxuXHJcbiAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IG1ha2VBdXRoZW50aWNhdGVkUmVxdWVzdChjb3VudHJpZXNVcmwpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENFNSBDb3VudHJpZXMgcmVzcG9uc2Ugc3RhdHVzOicsIHJlc3BvbnNlLnN0YXR1cyk7XHJcblxyXG4gICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgICBjb25zdCBlcnJvclRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBlU0lNIGNvdW50cmllcyBBUEkgZXJyb3I6JywgcmVzcG9uc2Uuc3RhdHVzLCBlcnJvclRleHQpO1xyXG4gICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IHJlc3BvbnNlLnN0YXR1cztcclxuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIGNvdW50cmllcycsIGRldGFpbHM6IGVycm9yVGV4dCB9KSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENDNCBSQVcgQ09VTlRSSUVTIERBVEEgRlJPTSBBUEk6JywgSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMikpO1xyXG5cclxuICAgICAgICAgIC8vIEhhbmRsZSB0aGUgYWN0dWFsIEFQSSByZXNwb25zZSBmb3JtYXQ6IHtzdGF0dXM6IHRydWUsIGRhdGE6IHtjb3VudHJ5X25hbWU6IGlzb19jb2RlfX1cclxuICAgICAgICAgIGxldCBjb3VudHJpZXMgPSBbXTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgaWYgKGRhdGEuc3RhdHVzICYmIGRhdGEuZGF0YSkge1xyXG4gICAgICAgICAgICAvLyBUaGUgZGF0YS5kYXRhIGNvbnRhaW5zIHRoZSBjb3VudHJpZXMgb2JqZWN0XHJcbiAgICAgICAgICAgIGNvdW50cmllcyA9IE9iamVjdC5lbnRyaWVzKGRhdGEuZGF0YSkubWFwKChbbmFtZSwgaXNvXSkgPT4gKHsgbmFtZSwgaXNvIH0pKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRhdGEgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KGRhdGEpKSB7XHJcbiAgICAgICAgICAgIC8vIEZhbGxiYWNrOiBpZiBpdCdzIGEgZGlyZWN0IG9iamVjdCB3aXRoIGNvdW50cmllc1xyXG4gICAgICAgICAgICBjb3VudHJpZXMgPSBPYmplY3QuZW50cmllcyhkYXRhKS5tYXAoKFtuYW1lLCBpc29dKSA9PiAoeyBuYW1lLCBpc28gfSkpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIFVuZXhwZWN0ZWQgY291bnRyaWVzIGRhdGEgZm9ybWF0OicsIGRhdGEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzA1IFBST0NFU1NFRCBDT1VOVFJJRVMgQ09VTlQ6JywgY291bnRyaWVzLmxlbmd0aCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERDBEIEZJUlNUIDUgQ09VTlRSSUVTOicsIEpTT04uc3RyaW5naWZ5KGNvdW50cmllcy5zbGljZSgwLCA1KSwgbnVsbCwgMikpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzQ1x1REYwRCBTRU5ESU5HIENPVU5UUklFUyBUTyBGUk9OVEVORDonLCBKU09OLnN0cmluZ2lmeShjb3VudHJpZXMsIG51bGwsIDIpKTtcclxuXHJcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeShjb3VudHJpZXMpKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIENvdW50cmllcyBlbmRwb2ludCBlcnJvcjonLCBlcnJvcik7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDUwMDtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicsIGRldGFpbHM6IGVycm9yLm1lc3NhZ2UgfSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBQYWNrYWdlcyBlbmRwb2ludFxyXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL2VzaW0vcGFja2FnZXMnLCBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0U2IFBhY2thZ2VzIGVuZHBvaW50IGNhbGxlZCcpO1xyXG5cclxuICAgICAgICBpZiAocmVxLm1ldGhvZCAhPT0gJ0dFVCcpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3NEMgV3JvbmcgbWV0aG9kOicsIHJlcS5tZXRob2QpO1xyXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDU7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdNZXRob2Qgbm90IGFsbG93ZWQnIH0pKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwocmVxLnVybCwgYGh0dHA6Ly8ke3JlcS5oZWFkZXJzLmhvc3R9YCk7XHJcbiAgICAgICAgY29uc3QgY291bnRyeUlkID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoJ2NvdW50cnlJZCcpO1xyXG4gICAgICAgIGNvbnN0IHBhY2thZ2VUeXBlID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoJ3BhY2thZ2VUeXBlJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENFNiBQQUNLQUdFUyBBUEk6IFJlY2VpdmVkIGNvdW50cnlJZDonLCBjb3VudHJ5SWQpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDRTYgUEFDS0FHRVMgQVBJOiBSZWNlaXZlZCBwYWNrYWdlVHlwZTonLCBwYWNrYWdlVHlwZSk7XHJcblxyXG4gICAgICAgIGlmICghY291bnRyeUlkKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzRDIE5vIGNvdW50cnlJZCBwYXJhbWV0ZXIgcHJvdmlkZWQnKTtcclxuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDAwO1xyXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnY291bnRyeUlkIHBhcmFtZXRlciBpcyByZXF1aXJlZCcgfSkpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFwYWNrYWdlVHlwZSkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1Mjc0QyBObyBwYWNrYWdlVHlwZSBwYXJhbWV0ZXIgcHJvdmlkZWQnKTtcclxuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDAwO1xyXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAncGFja2FnZVR5cGUgcGFyYW1ldGVyIGlzIHJlcXVpcmVkIChEQVRBLU9OTFkgb3IgREFUQS1WT0lDRS1TTVMpJyB9KSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBWYWxpZGF0ZSBwYWNrYWdlIHR5cGVcclxuICAgICAgICBpZiAoIVsnREFUQS1PTkxZJywgJ0RBVEEtVk9JQ0UtU01TJ10uaW5jbHVkZXMocGFja2FnZVR5cGUpKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzRDIEludmFsaWQgcGFja2FnZVR5cGU6JywgcGFja2FnZVR5cGUpO1xyXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDA7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdwYWNrYWdlVHlwZSBtdXN0IGJlIERBVEEtT05MWSBvciBEQVRBLVZPSUNFLVNNUycgfSkpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IHBhY2thZ2VzVXJsID0gYCR7RVNJTV9BUElfQkFTRX0vcGFja2FnZXMvY291bnRyeS8ke2NvdW50cnlJZH0vJHtwYWNrYWdlVHlwZX1gO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENFNiBQQUNLQUdFUyBBUEk6IE1ha2luZyByZXF1ZXN0IHRvOicsIHBhY2thZ2VzVXJsKTtcclxuXHJcbiAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IG1ha2VBdXRoZW50aWNhdGVkUmVxdWVzdChwYWNrYWdlc1VybCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0U1IFBhY2thZ2VzIHJlc3BvbnNlIHN0YXR1czonLCByZXNwb25zZS5zdGF0dXMpO1xyXG5cclxuICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgY29uc3QgZXJyb3JUZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgZVNJTSBwYWNrYWdlcyBBUEkgZXJyb3I6JywgcmVzcG9uc2Uuc3RhdHVzLCBlcnJvclRleHQpO1xyXG4gICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IHJlc3BvbnNlLnN0YXR1cztcclxuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHBhY2thZ2VzJywgZGV0YWlsczogZXJyb3JUZXh0IH0pKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0U2IFBBQ0tBR0VTIEFQSTogUmVzcG9uc2UgZGF0YTonLCBkYXRhKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDRTYgUEFDS0FHRVMgQVBJOiBOdW1iZXIgb2YgcGFja2FnZXM6JywgQXJyYXkuaXNBcnJheShkYXRhKSA/IGRhdGEubGVuZ3RoIDogJ05vdCBhbiBhcnJheScpO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAvLyBIYW5kbGUgdGhlIEFQSSByZXNwb25zZSBmb3JtYXQgLSBleHRyYWN0IHRoZSBhY3R1YWwgcGFja2FnZXMgZGF0YVxyXG4gICAgICAgICAgbGV0IHBhY2thZ2VzID0gW107XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGlmIChkYXRhLnN0YXR1cyAmJiBkYXRhLmRhdGEpIHtcclxuICAgICAgICAgICAgcGFja2FnZXMgPSBBcnJheS5pc0FycmF5KGRhdGEuZGF0YSkgPyBkYXRhLmRhdGEgOiBbXTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xyXG4gICAgICAgICAgICBwYWNrYWdlcyA9IGRhdGE7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgVW5leHBlY3RlZCBwYWNrYWdlcyBkYXRhIGZvcm1hdDonLCBkYXRhKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1MjcwNSBQUk9DRVNTRUQgUEFDS0FHRVMgQ09VTlQ6JywgcGFja2FnZXMubGVuZ3RoKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMEQgRklSU1QgMyBQQUNLQUdFUzonLCBKU09OLnN0cmluZ2lmeShwYWNrYWdlcy5zbGljZSgwLCAzKSwgbnVsbCwgMikpO1xyXG5cclxuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHBhY2thZ2VzKSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBQYWNrYWdlcyBlbmRwb2ludCBlcnJvcjonLCBlcnJvcik7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDUwMDtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicsIGRldGFpbHM6IGVycm9yLm1lc3NhZ2UgfSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBQYWNrYWdlIERldGFpbHMgZW5kcG9pbnRcclxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaS9lc2ltL3BhY2thZ2UtZGV0YWlscycsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDQ0IgUGFja2FnZSBEZXRhaWxzIGVuZHBvaW50IGNhbGxlZCcpO1xyXG5cclxuICAgICAgICBpZiAocmVxLm1ldGhvZCAhPT0gJ0dFVCcpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3NEMgV3JvbmcgbWV0aG9kOicsIHJlcS5tZXRob2QpO1xyXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDU7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdNZXRob2Qgbm90IGFsbG93ZWQnIH0pKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwocmVxLnVybCwgYGh0dHA6Ly8ke3JlcS5oZWFkZXJzLmhvc3R9YCk7XHJcbiAgICAgICAgY29uc3QgcGFja2FnZUlkID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoJ3BhY2thZ2VJZCcpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDQ0IgUEFDS0FHRSBERVRBSUxTIEFQSTogUmVjZWl2ZWQgcGFja2FnZUlkOicsIHBhY2thZ2VJZCk7XHJcblxyXG4gICAgICAgIGlmICghcGFja2FnZUlkKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzRDIE5vIHBhY2thZ2VJZCBwYXJhbWV0ZXIgcHJvdmlkZWQnKTtcclxuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDAwO1xyXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAncGFja2FnZUlkIHBhcmFtZXRlciBpcyByZXF1aXJlZCcgfSkpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IGRldGFpbHNVcmwgPSBgJHtFU0lNX0FQSV9CQVNFfS9wYWNrYWdlL2RldGFpbC8ke3BhY2thZ2VJZH1gO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENDQiBQQUNLQUdFIERFVEFJTFMgQVBJOiBNYWtpbmcgcmVxdWVzdCB0bzonLCBkZXRhaWxzVXJsKTtcclxuXHJcbiAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IG1ha2VBdXRoZW50aWNhdGVkUmVxdWVzdChkZXRhaWxzVXJsKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDRTUgUGFja2FnZSBkZXRhaWxzIHJlc3BvbnNlIHN0YXR1czonLCByZXNwb25zZS5zdGF0dXMpO1xyXG5cclxuICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgY29uc3QgZXJyb3JUZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgZVNJTSBwYWNrYWdlIGRldGFpbHMgQVBJIGVycm9yOicsIHJlc3BvbnNlLnN0YXR1cywgZXJyb3JUZXh0KTtcclxuICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSByZXNwb25zZS5zdGF0dXM7XHJcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBwYWNrYWdlIGRldGFpbHMnLCBkZXRhaWxzOiBlcnJvclRleHQgfSkpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDQ0IgUEFDS0FHRSBERVRBSUxTIEFQSTogUmVzcG9uc2UgZGF0YTonLCBkYXRhKTtcclxuXHJcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBQYWNrYWdlIGRldGFpbHMgZW5kcG9pbnQgZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InLCBkZXRhaWxzOiBlcnJvci5tZXNzYWdlIH0pKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gUHVyY2hhc2UgUGFja2FnZSBlbmRwb2ludFxyXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL2VzaW0vcHVyY2hhc2UnLCBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0IzIFB1cmNoYXNlIFBhY2thZ2UgZW5kcG9pbnQgY2FsbGVkJyk7XHJcblxyXG4gICAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnUE9TVCcpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3NEMgV3JvbmcgbWV0aG9kOicsIHJlcS5tZXRob2QpO1xyXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDU7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdNZXRob2Qgbm90IGFsbG93ZWQnIH0pKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBib2R5ID0gJyc7XHJcbiAgICAgICAgcmVxLm9uKCdkYXRhJywgY2h1bmsgPT4ge1xyXG4gICAgICAgICAgYm9keSArPSBjaHVuay50b1N0cmluZygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXEub24oJ2VuZCcsIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHsgcGFja2FnZUlkLCBwYWNrYWdlVHlwZSB9ID0gSlNPTi5wYXJzZShib2R5KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDQjMgUFVSQ0hBU0UgQVBJOiBSZWNlaXZlZCBwYWNrYWdlSWQ6JywgcGFja2FnZUlkKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENCMyBQVVJDSEFTRSBBUEk6IFJlY2VpdmVkIHBhY2thZ2VUeXBlOicsIHBhY2thZ2VUeXBlKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghcGFja2FnZUlkKSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDA7XHJcbiAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAncGFja2FnZUlkIGlzIHJlcXVpcmVkJyB9KSk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXBhY2thZ2VUeXBlKSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDA7XHJcbiAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAncGFja2FnZVR5cGUgaXMgcmVxdWlyZWQgKERBVEEtT05MWSBvciBEQVRBLVZPSUNFLVNNUyknIH0pKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFZhbGlkYXRlIHBhY2thZ2UgdHlwZVxyXG4gICAgICAgICAgICBpZiAoIVsnREFUQS1PTkxZJywgJ0RBVEEtVk9JQ0UtU01TJ10uaW5jbHVkZXMocGFja2FnZVR5cGUpKSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDA7XHJcbiAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAncGFja2FnZVR5cGUgbXVzdCBiZSBEQVRBLU9OTFkgb3IgREFUQS1WT0lDRS1TTVMnIH0pKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBwdXJjaGFzZVVybDtcclxuICAgICAgICAgICAgbGV0IHJlcXVlc3RCb2R5O1xyXG5cclxuICAgICAgICAgICAgaWYgKHBhY2thZ2VUeXBlID09PSAnREFUQS1PTkxZJykge1xyXG4gICAgICAgICAgICAgIC8vIEZvciBEQVRBLU9OTFkgcGFja2FnZXNcclxuICAgICAgICAgICAgICBwdXJjaGFzZVVybCA9IGAke0VTSU1fQVBJX0JBU0V9L3BhY2thZ2UvcHVyY2hhc2U/dGVzdD10cnVlYDtcclxuICAgICAgICAgICAgICByZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgICAgICAgICAgIHBhY2thZ2VfdHlwZV9pZDogcGFja2FnZUlkXHJcbiAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAvLyBGb3IgREFUQS1WT0lDRS1TTVMgcGFja2FnZXNcclxuICAgICAgICAgICAgICBwdXJjaGFzZVVybCA9IGAke0VTSU1fQVBJX0JBU0V9L3BhY2thZ2UvZGF0ZV92b2ljZV9zbXMvcHVyY2hhc2VgO1xyXG4gICAgICAgICAgICAgIHJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICAgICAgICAgICAgcGFja2FnZV90eXBlX2lkOiBwYWNrYWdlSWRcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0IzIFBVUkNIQVNFIEFQSTogTWFraW5nIHJlcXVlc3QgdG86JywgcHVyY2hhc2VVcmwpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0IzIFBVUkNIQVNFIEFQSTogUmVxdWVzdCBib2R5OicsIHJlcXVlc3RCb2R5KTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgbWFrZUF1dGhlbnRpY2F0ZWRSZXF1ZXN0KHB1cmNoYXNlVXJsLCB7XHJcbiAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocmVxdWVzdEJvZHkpXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENFNSBQdXJjaGFzZSByZXNwb25zZSBzdGF0dXM6JywgcmVzcG9uc2Uuc3RhdHVzKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgICBjb25zdCBlcnJvclRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIGVTSU0gcHVyY2hhc2UgQVBJIGVycm9yOicsIHJlc3BvbnNlLnN0YXR1cywgZXJyb3JUZXh0KTtcclxuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IHJlc3BvbnNlLnN0YXR1cztcclxuICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdGYWlsZWQgdG8gcHVyY2hhc2UgcGFja2FnZScsIGRldGFpbHM6IGVycm9yVGV4dCB9KSk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0IzIFBVUkNIQVNFIEFQSTogUmVzcG9uc2UgZGF0YTonLCBkYXRhKTtcclxuXHJcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xyXG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIFB1cmNoYXNlIGVuZHBvaW50IGVycm9yOicsIGVycm9yKTtcclxuICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XHJcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicsIGRldGFpbHM6IGVycm9yLm1lc3NhZ2UgfSkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFVzZXIgZVNJTXMgZW5kcG9pbnQgLSB0aGlzIHdvdWxkIHR5cGljYWxseSBxdWVyeSB5b3VyIGRhdGFiYXNlXHJcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hcGkvdXNlci9lc2ltcycsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDNjQgVXNlciBlU0lNcyBlbmRwb2ludCBjYWxsZWQnKTtcclxuXHJcbiAgICAgICAgaWYgKHJlcS5tZXRob2QgIT09ICdHRVQnKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzRDIFdyb25nIG1ldGhvZDonLCByZXEubWV0aG9kKTtcclxuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDA1O1xyXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnTWV0aG9kIG5vdCBhbGxvd2VkJyB9KSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENDNCBSZXR1cm5pbmcgZW1wdHkgZVNJTXMgYXJyYXkgKG5vIHVzZXIgc3lzdGVtIGludGVncmF0ZWQgeWV0KScpO1xyXG5cclxuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXNpbXM6IFtdIH0pKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIFVzZXIgZVNJTXMgZW5kcG9pbnQgZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InLCBkZXRhaWxzOiBlcnJvci5tZXNzYWdlIH0pKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcbn0iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHVzZXJcXFxcRGVza3RvcFxcXFxvcmJpdC1jb21tXFxcXHNyY1xcXFxtaWRkbGV3YXJlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx1c2VyXFxcXERlc2t0b3BcXFxcb3JiaXQtY29tbVxcXFxzcmNcXFxcbWlkZGxld2FyZVxcXFxwYXlzdGFjay1hcGkuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3VzZXIvRGVza3RvcC9vcmJpdC1jb21tL3NyYy9taWRkbGV3YXJlL3BheXN0YWNrLWFwaS5qc1wiOy8vIFBheXN0YWNrIEFQSSBtaWRkbGV3YXJlIGZvciBWaXRlIGRldiBzZXJ2ZXJcclxuY29uc3QgUEFZU1RBQ0tfU0VDUkVUX0tFWSA9ICdza19saXZlX2E4OTkyZmI1NmU0NGI2ZmQxM2Q0NjE1YjNhMmFlMWQ0MjdjNzcxOGUnO1xyXG5jb25zdCBQQVlTVEFDS19CQVNFX1VSTCA9ICdodHRwczovL2FwaS5wYXlzdGFjay5jbyc7XHJcblxyXG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gbWFrZSBhdXRoZW50aWNhdGVkIHJlcXVlc3RzIHRvIFBheXN0YWNrXHJcbmFzeW5jIGZ1bmN0aW9uIG1ha2VQYXlzdGFja1JlcXVlc3QoZW5kcG9pbnQsIG9wdGlvbnMgPSB7fSkge1xyXG4gIGNvbnN0IHVybCA9IGAke1BBWVNUQUNLX0JBU0VfVVJMfSR7ZW5kcG9pbnR9YDtcclxuICBcclxuICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0UxIE1ha2luZyBQYXlzdGFjayByZXF1ZXN0OicsIHsgXHJcbiAgICBtZXRob2Q6IG9wdGlvbnMubWV0aG9kIHx8ICdHRVQnLCBcclxuICAgIHVybCxcclxuICAgIGJvZHk6IG9wdGlvbnMuYm9keSA/IEpTT04ucGFyc2Uob3B0aW9ucy5ib2R5KSA6IG51bGxcclxuICB9KTtcclxuICBcclxuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xyXG4gICAgLi4ub3B0aW9ucyxcclxuICAgIGhlYWRlcnM6IHtcclxuICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7UEFZU1RBQ0tfU0VDUkVUX0tFWX1gLFxyXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAuLi5vcHRpb25zLmhlYWRlcnNcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENFNSBQYXlzdGFjayByZXNwb25zZTonLCB7IFxyXG4gICAgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMsIFxyXG4gICAgc3RhdHVzVGV4dDogcmVzcG9uc2Uuc3RhdHVzVGV4dCxcclxuICAgIHVybCBcclxuICB9KTtcclxuXHJcbiAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgY29uc3QgZXJyb3JEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7IG1lc3NhZ2U6IHJlc3BvbnNlLnN0YXR1c1RleHQgfSkpO1xyXG4gICAgY29uc29sZS5lcnJvcignXHUyNzRDIFBheXN0YWNrIEFQSSBlcnJvciBkZXRhaWxzOicsIGVycm9yRGF0YSk7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFBheXN0YWNrIEFQSSBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9IC0gJHtKU09OLnN0cmluZ2lmeShlcnJvckRhdGEpfWApO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuICBjb25zb2xlLmxvZygnXHUyNzA1IFBheXN0YWNrIHJlc3BvbnNlIGRhdGE6JywgZGF0YSk7XHJcbiAgcmV0dXJuIGRhdGE7XHJcbn1cclxuXHJcbi8vIENyZWF0ZSBvciBnZXQgY3VzdG9tZXJcclxuYXN5bmMgZnVuY3Rpb24gZ2V0T3JDcmVhdGVDdXN0b21lcihlbWFpbCwgZmlyc3ROYW1lID0gJycsIGxhc3ROYW1lID0gJycpIHtcclxuICB0cnkge1xyXG4gICAgLy8gRmlyc3QsIHRyeSB0byBmZXRjaCBleGlzdGluZyBjdXN0b21lciBieSBlbWFpbFxyXG4gICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQwRCBTZWFyY2hpbmcgZm9yIGV4aXN0aW5nIGN1c3RvbWVyOicsIGVtYWlsKTtcclxuICAgIFxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgZXhpc3RpbmdDdXN0b21lciA9IGF3YWl0IG1ha2VQYXlzdGFja1JlcXVlc3QoYC9jdXN0b21lci8ke2VuY29kZVVSSUNvbXBvbmVudChlbWFpbCl9YCk7XHJcbiAgICAgIGlmIChleGlzdGluZ0N1c3RvbWVyLmRhdGEpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnXHUyNzA1IEZvdW5kIGV4aXN0aW5nIGN1c3RvbWVyOicsIGV4aXN0aW5nQ3VzdG9tZXIuZGF0YS5jdXN0b21lcl9jb2RlKTtcclxuICAgICAgICByZXR1cm4gZXhpc3RpbmdDdXN0b21lci5kYXRhO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAvLyBDdXN0b21lciBub3QgZm91bmQsIHdpbGwgY3JlYXRlIG5ldyBvbmVcclxuICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQwRCBDdXN0b21lciBub3QgZm91bmQsIHdpbGwgY3JlYXRlIG5ldyBvbmUnKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiBubyBjdXN0b21lciBmb3VuZCwgY3JlYXRlIG5ldyBvbmVcclxuICAgIGNvbnNvbGUubG9nKCdcdUQ4M0NcdUREOTUgQ3JlYXRpbmcgbmV3IGN1c3RvbWVyIGZvcjonLCBlbWFpbCk7XHJcbiAgICBjb25zdCBuZXdDdXN0b21lciA9IGF3YWl0IG1ha2VQYXlzdGFja1JlcXVlc3QoJy9jdXN0b21lcicsIHtcclxuICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICBlbWFpbCxcclxuICAgICAgICBmaXJzdF9uYW1lOiBmaXJzdE5hbWUgfHwgZW1haWwuc3BsaXQoJ0AnKVswXSxcclxuICAgICAgICBsYXN0X25hbWU6IGxhc3ROYW1lIHx8ICdVc2VyJ1xyXG4gICAgICB9KVxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc29sZS5sb2coJ1x1MjcwNSBDcmVhdGVkIG5ldyBjdXN0b21lcjonLCBuZXdDdXN0b21lci5kYXRhLmN1c3RvbWVyX2NvZGUpO1xyXG4gICAgcmV0dXJuIG5ld0N1c3RvbWVyLmRhdGE7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBFcnJvciB3aXRoIGN1c3RvbWVyOicsIGVycm9yKTtcclxuICAgIHRocm93IGVycm9yO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBheXN0YWNrQXBpTWlkZGxld2FyZSgpIHtcclxuICByZXR1cm4ge1xyXG4gICAgbmFtZTogJ3BheXN0YWNrLWFwaS1taWRkbGV3YXJlJyxcclxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcclxuICAgICAgXHJcbiAgICAgIC8vIEdldCB1c2VyIGJhbGFuY2UgZW5kcG9pbnRcclxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaS9wYXlzdGFjay9iYWxhbmNlJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENCMCBCYWxhbmNlIGVuZHBvaW50IGNhbGxlZCcpO1xyXG5cclxuICAgICAgICBpZiAocmVxLm1ldGhvZCAhPT0gJ1BPU1QnKSB7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNTtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ01ldGhvZCBub3QgYWxsb3dlZCcgfSkpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGJvZHkgPSAnJztcclxuICAgICAgICByZXEub24oJ2RhdGEnLCBjaHVuayA9PiB7XHJcbiAgICAgICAgICBib2R5ICs9IGNodW5rLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJlcS5vbignZW5kJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgeyBlbWFpbCB9ID0gSlNPTi5wYXJzZShib2R5KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICghZW1haWwpIHtcclxuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwMDtcclxuICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdFbWFpbCBpcyByZXF1aXJlZCcgfSkpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENCMCBGZXRjaGluZyBiYWxhbmNlIGZvcjonLCBlbWFpbCk7XHJcblxyXG4gICAgICAgICAgICAvLyBHZXQgb3IgY3JlYXRlIGN1c3RvbWVyXHJcbiAgICAgICAgICAgIGNvbnN0IGN1c3RvbWVyID0gYXdhaXQgZ2V0T3JDcmVhdGVDdXN0b21lcihlbWFpbCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBHZXQgY3VzdG9tZXIgYmFsYW5jZSAoUGF5c3RhY2sgZG9lc24ndCBoYXZlIGRpcmVjdCBiYWxhbmNlIEFQSSwgc28gd2UnbGwgY2FsY3VsYXRlIGZyb20gdHJhbnNhY3Rpb25zKVxyXG4gICAgICAgICAgICBjb25zdCB0cmFuc2FjdGlvbnMgPSBhd2FpdCBtYWtlUGF5c3RhY2tSZXF1ZXN0KGAvdHJhbnNhY3Rpb24/Y3VzdG9tZXI9JHtjdXN0b21lci5jdXN0b21lcl9jb2RlfSZzdGF0dXM9c3VjY2Vzc2ApO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIGJhbGFuY2UgZnJvbSBzdWNjZXNzZnVsIHRyYW5zYWN0aW9uc1xyXG4gICAgICAgICAgICBsZXQgYmFsYW5jZSA9IDA7XHJcbiAgICAgICAgICAgIGlmICh0cmFuc2FjdGlvbnMuZGF0YSAmJiB0cmFuc2FjdGlvbnMuZGF0YS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgYmFsYW5jZSA9IHRyYW5zYWN0aW9ucy5kYXRhLnJlZHVjZSgodG90YWwsIHRyYW5zYWN0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBBZGQgZGVwb3NpdHMsIHN1YnRyYWN0IHB1cmNoYXNlc1xyXG4gICAgICAgICAgICAgICAgaWYgKHRyYW5zYWN0aW9uLm1ldGFkYXRhICYmIHRyYW5zYWN0aW9uLm1ldGFkYXRhLnR5cGUgPT09ICd3YWxsZXRfZnVuZGluZycpIHtcclxuICAgICAgICAgICAgICAgICAgLy8gQ29udmVydCBmcm9tIE5HTiBiYWNrIHRvIFVTRCB1c2luZyBvcmlnaW5hbCBhbW91bnQgaWYgYXZhaWxhYmxlXHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsVXNkQW1vdW50ID0gdHJhbnNhY3Rpb24ubWV0YWRhdGEub3JpZ2luYWxfdXNkX2Ftb3VudDtcclxuICAgICAgICAgICAgICAgICAgaWYgKG9yaWdpbmFsVXNkQW1vdW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRvdGFsICsgb3JpZ2luYWxVc2RBbW91bnQ7XHJcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRmFsbGJhY2s6IGNvbnZlcnQgTkdOIHRvIFVTRCAoYXBwcm94aW1hdGUpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRvdGFsICsgKHRyYW5zYWN0aW9uLmFtb3VudCAvIDEwMCAvIDgwMCk7IC8vIE5HTiB0byBVU0QgY29udmVyc2lvblxyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdG90YWw7XHJcbiAgICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgQmFsYW5jZSBjYWxjdWxhdGVkOicsIGJhbGFuY2UpO1xyXG5cclxuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IFxyXG4gICAgICAgICAgICAgIGJhbGFuY2UsXHJcbiAgICAgICAgICAgICAgY3VycmVuY3k6ICdVU0QnLFxyXG4gICAgICAgICAgICAgIGN1c3RvbWVyX2NvZGU6IGN1c3RvbWVyLmN1c3RvbWVyX2NvZGUgXHJcbiAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgQmFsYW5jZSBlbmRwb2ludCBlcnJvcjonLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xyXG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InLCBkZXRhaWxzOiBlcnJvci5tZXNzYWdlIH0pKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBJbml0aWFsaXplIHBheW1lbnQgZW5kcG9pbnRcclxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaS9wYXlzdGFjay9pbml0aWFsaXplJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REU4MCBJbml0aWFsaXplIHBheW1lbnQgZW5kcG9pbnQgY2FsbGVkJyk7XHJcblxyXG4gICAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnUE9TVCcpIHtcclxuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDA1O1xyXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnTWV0aG9kIG5vdCBhbGxvd2VkJyB9KSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgYm9keSA9ICcnO1xyXG4gICAgICAgIHJlcS5vbignZGF0YScsIGNodW5rID0+IHtcclxuICAgICAgICAgIGJvZHkgKz0gY2h1bmsudG9TdHJpbmcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmVxLm9uKCdlbmQnLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCB7IGFtb3VudCwgZW1haWwsIGN1cnJlbmN5ID0gJ05HTicgfSA9IEpTT04ucGFyc2UoYm9keSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoIWFtb3VudCB8fCAhZW1haWwpIHtcclxuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwMDtcclxuICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdBbW91bnQgYW5kIGVtYWlsIGFyZSByZXF1aXJlZCcgfSkpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REU4MCBJbml0aWFsaXppbmcgcGF5bWVudDonLCB7IGFtb3VudCwgZW1haWwsIGN1cnJlbmN5IH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gR2V0IG9yIGNyZWF0ZSBjdXN0b21lclxyXG4gICAgICAgICAgICBjb25zdCBjdXN0b21lciA9IGF3YWl0IGdldE9yQ3JlYXRlQ3VzdG9tZXIoZW1haWwpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ29udmVydCBVU0QgdG8gTkdOIChhcHByb3hpbWF0ZSByYXRlOiAxIFVTRCA9IDgwMCBOR04pXHJcbiAgICAgICAgICAgIGNvbnN0IHVzZFRvTmduUmF0ZSA9IDgwMDtcclxuICAgICAgICAgICAgY29uc3QgYW1vdW50SW5OZ24gPSBNYXRoLnJvdW5kKChhbW91bnQgLyAxMDApICogdXNkVG9OZ25SYXRlICogMTAwKTsgLy8gQ29udmVydCBmcm9tIGtvYm8gdG8gVVNELCB0aGVuIHRvIE5HTiBrb2JvXHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0IxIEFtb3VudCBjb252ZXJzaW9uOicsIHsgXHJcbiAgICAgICAgICAgICAgb3JpZ2luYWxBbW91bnQ6IGFtb3VudCwgXHJcbiAgICAgICAgICAgICAgdXNkQW1vdW50OiBhbW91bnQgLyAxMDAsIFxyXG4gICAgICAgICAgICAgIG5nbkFtb3VudDogYW1vdW50SW5OZ24gLyAxMDAsXHJcbiAgICAgICAgICAgICAgbmduS29ibzogYW1vdW50SW5OZ24gXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSB0cmFuc2FjdGlvblxyXG4gICAgICAgICAgICBjb25zdCB0cmFuc2FjdGlvbiA9IGF3YWl0IG1ha2VQYXlzdGFja1JlcXVlc3QoJy90cmFuc2FjdGlvbi9pbml0aWFsaXplJywge1xyXG4gICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgICAgICAgIGFtb3VudDogYW1vdW50SW5OZ24sIC8vIEFtb3VudCBpbiBrb2JvIChOR04pXHJcbiAgICAgICAgICAgICAgICBlbWFpbCxcclxuICAgICAgICAgICAgICAgIGN1cnJlbmN5OiAnTkdOJywgLy8gUGF5c3RhY2sgbGl2ZSBrZXlzIHdvcmsgd2l0aCBOR05cclxuICAgICAgICAgICAgICAgIGN1c3RvbWVyOiBjdXN0b21lci5jdXN0b21lcl9jb2RlLFxyXG4gICAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgdHlwZTogJ3dhbGxldF9mdW5kaW5nJyxcclxuICAgICAgICAgICAgICAgICAgY3VzdG9tZXJfY29kZTogY3VzdG9tZXIuY3VzdG9tZXJfY29kZSxcclxuICAgICAgICAgICAgICAgICAgb3JpZ2luYWxfdXNkX2Ftb3VudDogYW1vdW50IC8gMTAwXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2tfdXJsOiBgJHtyZXEuaGVhZGVycy5vcmlnaW59L2Rhc2hib2FyZD9wYXltZW50PXN1Y2Nlc3NgLFxyXG4gICAgICAgICAgICAgICAgY2FuY2VsX3VybDogYCR7cmVxLmhlYWRlcnMub3JpZ2lufS9kYXNoYm9hcmQ/cGF5bWVudD1jYW5jZWxsZWRgXHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzA1IFBheW1lbnQgaW5pdGlhbGl6ZWQ6JywgdHJhbnNhY3Rpb24uZGF0YS5yZWZlcmVuY2UpO1xyXG5cclxuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh0cmFuc2FjdGlvbi5kYXRhKSk7XHJcblxyXG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIEluaXRpYWxpemUgcGF5bWVudCBlcnJvcjonLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xyXG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InLCBkZXRhaWxzOiBlcnJvci5tZXNzYWdlIH0pKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBWZXJpZnkgcGF5bWVudCBlbmRwb2ludFxyXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL3BheXN0YWNrL3ZlcmlmeScsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgVmVyaWZ5IHBheW1lbnQgZW5kcG9pbnQgY2FsbGVkJyk7XHJcblxyXG4gICAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnUE9TVCcpIHtcclxuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDA1O1xyXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnTWV0aG9kIG5vdCBhbGxvd2VkJyB9KSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgYm9keSA9ICcnO1xyXG4gICAgICAgIHJlcS5vbignZGF0YScsIGNodW5rID0+IHtcclxuICAgICAgICAgIGJvZHkgKz0gY2h1bmsudG9TdHJpbmcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmVxLm9uKCdlbmQnLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCB7IHJlZmVyZW5jZSB9ID0gSlNPTi5wYXJzZShib2R5KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICghcmVmZXJlbmNlKSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDA7XHJcbiAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnUmVmZXJlbmNlIGlzIHJlcXVpcmVkJyB9KSk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzA1IFZlcmlmeWluZyBwYXltZW50OicsIHJlZmVyZW5jZSk7XHJcblxyXG4gICAgICAgICAgICAvLyBWZXJpZnkgdHJhbnNhY3Rpb25cclxuICAgICAgICAgICAgY29uc3QgdmVyaWZpY2F0aW9uID0gYXdhaXQgbWFrZVBheXN0YWNrUmVxdWVzdChgL3RyYW5zYWN0aW9uL3ZlcmlmeS8ke3JlZmVyZW5jZX1gKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgUGF5bWVudCB2ZXJpZmljYXRpb24gcmVzdWx0OicsIHZlcmlmaWNhdGlvbi5kYXRhLnN0YXR1cyk7XHJcblxyXG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHZlcmlmaWNhdGlvbi5kYXRhKSk7XHJcblxyXG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIFZlcmlmeSBwYXltZW50IGVycm9yOicsIGVycm9yKTtcclxuICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XHJcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicsIGRldGFpbHM6IGVycm9yLm1lc3NhZ2UgfSkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIEdldCBjdXN0b21lciB0cmFuc2FjdGlvbnMgZW5kcG9pbnRcclxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaS9wYXlzdGFjay90cmFuc2FjdGlvbnMnLCBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0NBIFRyYW5zYWN0aW9ucyBlbmRwb2ludCBjYWxsZWQnKTtcclxuXHJcbiAgICAgICAgaWYgKHJlcS5tZXRob2QgIT09ICdQT1NUJykge1xyXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDU7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdNZXRob2Qgbm90IGFsbG93ZWQnIH0pKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBib2R5ID0gJyc7XHJcbiAgICAgICAgcmVxLm9uKCdkYXRhJywgY2h1bmsgPT4ge1xyXG4gICAgICAgICAgYm9keSArPSBjaHVuay50b1N0cmluZygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXEub24oJ2VuZCcsIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHsgZW1haWwgfSA9IEpTT04ucGFyc2UoYm9keSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoIWVtYWlsKSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDA7XHJcbiAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnRW1haWwgaXMgcmVxdWlyZWQnIH0pKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDQ0EgRmV0Y2hpbmcgdHJhbnNhY3Rpb25zIGZvcjonLCBlbWFpbCk7XHJcblxyXG4gICAgICAgICAgICAvLyBHZXQgY3VzdG9tZXJcclxuICAgICAgICAgICAgY29uc3QgY3VzdG9tZXIgPSBhd2FpdCBnZXRPckNyZWF0ZUN1c3RvbWVyKGVtYWlsKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIEdldCBjdXN0b21lciB0cmFuc2FjdGlvbnNcclxuICAgICAgICAgICAgY29uc3QgdHJhbnNhY3Rpb25zID0gYXdhaXQgbWFrZVBheXN0YWNrUmVxdWVzdChgL3RyYW5zYWN0aW9uP2N1c3RvbWVyPSR7Y3VzdG9tZXIuY3VzdG9tZXJfY29kZX1gKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgVHJhbnNhY3Rpb25zIGZldGNoZWQ6JywgdHJhbnNhY3Rpb25zLmRhdGE/Lmxlbmd0aCB8fCAwKTtcclxuXHJcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkodHJhbnNhY3Rpb25zLmRhdGEgfHwgW10pKTtcclxuXHJcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgVHJhbnNhY3Rpb25zIGVuZHBvaW50IGVycm9yOicsIGVycm9yKTtcclxuICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XHJcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicsIGRldGFpbHM6IGVycm9yLm1lc3NhZ2UgfSkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG59Il0sCiAgIm1hcHBpbmdzIjogIjtBQUE0UixTQUFTLG9CQUFvQjtBQUN6VCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBRWpCLFNBQVMsdUJBQXVCOzs7QUNGaEMsSUFBTSxnQkFBZ0I7QUFHdEIsSUFBSSxjQUFjO0FBQ2xCLElBQUksY0FBYztBQUdsQixlQUFlLGlCQUFpQjtBQUM5QixVQUFRLElBQUksbUNBQTRCO0FBR3hDLE1BQUksZUFBZSxlQUFlLEtBQUssSUFBSSxJQUFJLGFBQWE7QUFDMUQsWUFBUSxJQUFJLDJCQUFzQjtBQUNsQyxXQUFPO0FBQUEsRUFDVDtBQUdBLE1BQUk7QUFDRixZQUFRLElBQUkscUNBQThCO0FBQzFDLFVBQU0sV0FBVyxHQUFHLGFBQWE7QUFDakMsWUFBUSxJQUFJLHdCQUFpQixRQUFRO0FBRXJDLFVBQU0sV0FBVyxNQUFNLE1BQU0sVUFBVTtBQUFBLE1BQ3JDLFFBQVE7QUFBQSxNQUNSLFNBQVM7QUFBQSxRQUNQLGdCQUFnQjtBQUFBLFFBQ2hCLFVBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxNQUFNLEtBQUssVUFBVTtBQUFBLFFBQ25CLE9BQU87QUFBQSxRQUNQLFVBQVU7QUFBQSxNQUNaLENBQUM7QUFBQSxJQUNILENBQUM7QUFFRCxZQUFRLElBQUksb0NBQTZCLFNBQVMsTUFBTTtBQUV4RCxRQUFJLENBQUMsU0FBUyxJQUFJO0FBQ2hCLFlBQU0sWUFBWSxNQUFNLFNBQVMsS0FBSztBQUN0QyxjQUFRLE1BQU0sd0JBQW1CLFNBQVMsUUFBUSxTQUFTO0FBQzNELFlBQU0s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
