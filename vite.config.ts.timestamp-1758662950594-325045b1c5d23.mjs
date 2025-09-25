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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL21pZGRsZXdhcmUvZXNpbS1hcGkuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx1c2VyXFxcXERlc2t0b3BcXFxcb3JiaXQtY29tbVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcdXNlclxcXFxEZXNrdG9wXFxcXG9yYml0LWNvbW1cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3VzZXIvRGVza3RvcC9vcmJpdC1jb21tL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcclxuaW1wb3J0IHsgZXNpbUFwaU1pZGRsZXdhcmUgfSBmcm9tIFwiLi9zcmMvbWlkZGxld2FyZS9lc2ltLWFwaS5qc1wiO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIHBvcnQ6IDgwODAsXHJcbiAgICBwcm94eToge1xyXG4gICAgICBcIi9hcGkvdGlnZXItc21zXCI6IHtcclxuICAgICAgICB0YXJnZXQ6IFwiaHR0cHM6Ly9hcGkudGlnZXItc21zLmNvbVwiLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICByZXdyaXRlOiBwYXRoID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaVxcL3RpZ2VyLXNtcy8sIFwiL3N0dWJzL2hhbmRsZXJfYXBpLnBocFwiKSxcclxuICAgICAgfSxcclxuXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIGVzaW1BcGlNaWRkbGV3YXJlKCksXHJcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmXHJcbiAgICBjb21wb25lbnRUYWdnZXIoKSxcclxuICBdLmZpbHRlcihCb29sZWFuKSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxufSkpO1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHVzZXJcXFxcRGVza3RvcFxcXFxvcmJpdC1jb21tXFxcXHNyY1xcXFxtaWRkbGV3YXJlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx1c2VyXFxcXERlc2t0b3BcXFxcb3JiaXQtY29tbVxcXFxzcmNcXFxcbWlkZGxld2FyZVxcXFxlc2ltLWFwaS5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvdXNlci9EZXNrdG9wL29yYml0LWNvbW0vc3JjL21pZGRsZXdhcmUvZXNpbS1hcGkuanNcIjsvLyBWaXRlIG1pZGRsZXdhcmUgZm9yIGhhbmRsaW5nIGVTSU0gQVBJIHJvdXRlc1xyXG5cclxuY29uc3QgRVNJTV9BUElfQkFTRSA9ICdodHRwczovL2VzaW1jYXJkLmNvbS9hcGkvZGV2ZWxvcGVyL3Jlc2VsbGVyJztcclxuXHJcbi8vIENhY2hlIGZvciBhY2Nlc3MgdG9rZW5cclxubGV0IGNhY2hlZFRva2VuID0gbnVsbDtcclxubGV0IHRva2VuRXhwaXJ5ID0gbnVsbDtcclxuXHJcbi8vIEZ1bmN0aW9uIHRvIGdldCBhY2Nlc3MgdG9rZW5cclxuYXN5bmMgZnVuY3Rpb24gZ2V0QWNjZXNzVG9rZW4oKSB7XHJcbiAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQxMCBHZXR0aW5nIGFjY2VzcyB0b2tlbi4uLicpO1xyXG5cclxuICAvLyBDaGVjayBpZiB3ZSBoYXZlIGEgdmFsaWQgY2FjaGVkIHRva2VuXHJcbiAgaWYgKGNhY2hlZFRva2VuICYmIHRva2VuRXhwaXJ5ICYmIERhdGUubm93KCkgPCB0b2tlbkV4cGlyeSkge1xyXG4gICAgY29uc29sZS5sb2coJ1x1MjcwNSBVc2luZyBjYWNoZWQgdG9rZW4nKTtcclxuICAgIHJldHVybiBjYWNoZWRUb2tlbjtcclxuICB9XHJcblxyXG4gIC8vIExvZ2luIHRvIGdldCBuZXcgdG9rZW5cclxuICB0cnkge1xyXG4gICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REU4MCBMb2dnaW5nIGluIHRvIGVTSU0gQVBJLi4uJyk7XHJcbiAgICBjb25zdCBsb2dpblVybCA9IGAke0VTSU1fQVBJX0JBU0V9L2xvZ2luYDtcclxuICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDRTEgTG9naW4gVVJMOicsIGxvZ2luVXJsKTtcclxuXHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGxvZ2luVXJsLCB7XHJcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nXHJcbiAgICAgIH0sXHJcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICBlbWFpbDogJ2pvaG5vbW9kaWFnYmU0NEBnbWFpbC5jb20nLFxyXG4gICAgICAgIHBhc3N3b3JkOiAnMjQ3c2ltLm5ldHFwQCMkJ1xyXG4gICAgICB9KVxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENFNSBMb2dpbiByZXNwb25zZSBzdGF0dXM6JywgcmVzcG9uc2Uuc3RhdHVzKTtcclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgIGNvbnN0IGVycm9yVGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcclxuICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIExvZ2luIGZhaWxlZDonLCByZXNwb25zZS5zdGF0dXMsIGVycm9yVGV4dCk7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTG9naW4gZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c30gLSAke2Vycm9yVGV4dH1gKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG4gICAgY29uc29sZS5sb2coJ1x1MjcwNSBMb2dpbiBzdWNjZXNzZnVsISBUb2tlbiByZWNlaXZlZDonLCBkYXRhLmFjY2Vzc190b2tlbiA/ICdZRVMnIDogJ05PJyk7XHJcbiAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0M0IEZ1bGwgbG9naW4gcmVzcG9uc2U6JywgZGF0YSk7XHJcblxyXG4gICAgY2FjaGVkVG9rZW4gPSBkYXRhLmFjY2Vzc190b2tlbjtcclxuXHJcbiAgICAvLyBDYWNoZSBmb3IgNTAgbWludXRlcyAoYXNzdW1pbmcgMSBob3VyIGV4cGlyeSlcclxuICAgIHRva2VuRXhwaXJ5ID0gRGF0ZS5ub3coKSArICg1MCAqIDYwICogMTAwMCk7XHJcblxyXG4gICAgcmV0dXJuIGNhY2hlZFRva2VuO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgZVNJTSBBUEkgbG9naW4gZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgdGhyb3cgZXJyb3I7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBGdW5jdGlvbiB0byBtYWtlIGF1dGhlbnRpY2F0ZWQgcmVxdWVzdHNcclxuYXN5bmMgZnVuY3Rpb24gbWFrZUF1dGhlbnRpY2F0ZWRSZXF1ZXN0KHVybCwgb3B0aW9ucyA9IHt9KSB7XHJcbiAgY29uc3QgdG9rZW4gPSBhd2FpdCBnZXRBY2Nlc3NUb2tlbigpO1xyXG5cclxuICByZXR1cm4gZmV0Y2godXJsLCB7XHJcbiAgICAuLi5vcHRpb25zLFxyXG4gICAgaGVhZGVyczoge1xyXG4gICAgICAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHt0b2tlbn1gLFxyXG4gICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAuLi5vcHRpb25zLmhlYWRlcnNcclxuICAgIH1cclxuICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGVzaW1BcGlNaWRkbGV3YXJlKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiAnZXNpbS1hcGktbWlkZGxld2FyZScsXHJcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XHJcbiAgICAgIC8vIENvdW50cmllcyBlbmRwb2ludFxyXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL2VzaW0vY291bnRyaWVzJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzQ1x1REYwRCBDb3VudHJpZXMgZW5kcG9pbnQgY2FsbGVkJyk7XHJcblxyXG4gICAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnR0VUJykge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1Mjc0QyBXcm9uZyBtZXRob2Q6JywgcmVxLm1ldGhvZCk7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNTtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ01ldGhvZCBub3QgYWxsb3dlZCcgfSkpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IGNvdW50cmllc1VybCA9IGAke0VTSU1fQVBJX0JBU0V9L3BhY2thZ2VzL2NvdW50cnlgO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENFMSBGZXRjaGluZyBjb3VudHJpZXMgZnJvbTonLCBjb3VudHJpZXNVcmwpO1xyXG5cclxuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgbWFrZUF1dGhlbnRpY2F0ZWRSZXF1ZXN0KGNvdW50cmllc1VybCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0U1IENvdW50cmllcyByZXNwb25zZSBzdGF0dXM6JywgcmVzcG9uc2Uuc3RhdHVzKTtcclxuXHJcbiAgICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVycm9yVGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIGVTSU0gY291bnRyaWVzIEFQSSBlcnJvcjonLCByZXNwb25zZS5zdGF0dXMsIGVycm9yVGV4dCk7XHJcbiAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gcmVzcG9uc2Uuc3RhdHVzO1xyXG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggY291bnRyaWVzJywgZGV0YWlsczogZXJyb3JUZXh0IH0pKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0M0IFJBVyBDT1VOVFJJRVMgREFUQSBGUk9NIEFQSTonLCBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKSk7XHJcblxyXG4gICAgICAgICAgLy8gSGFuZGxlIHRoZSBhY3R1YWwgQVBJIHJlc3BvbnNlIGZvcm1hdDoge3N0YXR1czogdHJ1ZSwgZGF0YToge2NvdW50cnlfbmFtZTogaXNvX2NvZGV9fVxyXG4gICAgICAgICAgbGV0IGNvdW50cmllcyA9IFtdO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBpZiAoZGF0YS5zdGF0dXMgJiYgZGF0YS5kYXRhKSB7XHJcbiAgICAgICAgICAgIC8vIFRoZSBkYXRhLmRhdGEgY29udGFpbnMgdGhlIGNvdW50cmllcyBvYmplY3RcclxuICAgICAgICAgICAgY291bnRyaWVzID0gT2JqZWN0LmVudHJpZXMoZGF0YS5kYXRhKS5tYXAoKFtuYW1lLCBpc29dKSA9PiAoeyBuYW1lLCBpc28gfSkpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoZGF0YSkpIHtcclxuICAgICAgICAgICAgLy8gRmFsbGJhY2s6IGlmIGl0J3MgYSBkaXJlY3Qgb2JqZWN0IHdpdGggY291bnRyaWVzXHJcbiAgICAgICAgICAgIGNvdW50cmllcyA9IE9iamVjdC5lbnRyaWVzKGRhdGEpLm1hcCgoW25hbWUsIGlzb10pID0+ICh7IG5hbWUsIGlzbyB9KSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgVW5leHBlY3RlZCBjb3VudHJpZXMgZGF0YSBmb3JtYXQ6JywgZGF0YSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgUFJPQ0VTU0VEIENPVU5UUklFUyBDT1VOVDonLCBjb3VudHJpZXMubGVuZ3RoKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMEQgRklSU1QgNSBDT1VOVFJJRVM6JywgSlNPTi5zdHJpbmdpZnkoY291bnRyaWVzLnNsaWNlKDAsIDUpLCBudWxsLCAyKSk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNDXHVERjBEIFNFTkRJTkcgQ09VTlRSSUVTIFRPIEZST05URU5EOicsIEpTT04uc3RyaW5naWZ5KGNvdW50cmllcywgbnVsbCwgMikpO1xyXG5cclxuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KGNvdW50cmllcykpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgQ291bnRyaWVzIGVuZHBvaW50IGVycm9yOicsIGVycm9yKTtcclxuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xyXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJywgZGV0YWlsczogZXJyb3IubWVzc2FnZSB9KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFBhY2thZ2VzIGVuZHBvaW50XHJcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hcGkvZXNpbS9wYWNrYWdlcycsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDRTYgUGFja2FnZXMgZW5kcG9pbnQgY2FsbGVkJyk7XHJcblxyXG4gICAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnR0VUJykge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1Mjc0QyBXcm9uZyBtZXRob2Q6JywgcmVxLm1ldGhvZCk7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNTtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ01ldGhvZCBub3QgYWxsb3dlZCcgfSkpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChyZXEudXJsLCBgaHR0cDovLyR7cmVxLmhlYWRlcnMuaG9zdH1gKTtcclxuICAgICAgICBjb25zdCBjb3VudHJ5SWQgPSB1cmwuc2VhcmNoUGFyYW1zLmdldCgnY291bnRyeUlkJyk7XHJcbiAgICAgICAgY29uc3QgcGFja2FnZVR5cGUgPSB1cmwuc2VhcmNoUGFyYW1zLmdldCgncGFja2FnZVR5cGUnKTtcclxuICAgICAgICBcclxuICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0U2IFBBQ0tBR0VTIEFQSTogUmVjZWl2ZWQgY291bnRyeUlkOicsIGNvdW50cnlJZCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENFNiBQQUNLQUdFUyBBUEk6IFJlY2VpdmVkIHBhY2thZ2VUeXBlOicsIHBhY2thZ2VUeXBlKTtcclxuXHJcbiAgICAgICAgaWYgKCFjb3VudHJ5SWQpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3NEMgTm8gY291bnRyeUlkIHBhcmFtZXRlciBwcm92aWRlZCcpO1xyXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDA7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdjb3VudHJ5SWQgcGFyYW1ldGVyIGlzIHJlcXVpcmVkJyB9KSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXBhY2thZ2VUeXBlKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzRDIE5vIHBhY2thZ2VUeXBlIHBhcmFtZXRlciBwcm92aWRlZCcpO1xyXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDA7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdwYWNrYWdlVHlwZSBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQgKERBVEEtT05MWSBvciBEQVRBLVZPSUNFLVNNUyknIH0pKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFZhbGlkYXRlIHBhY2thZ2UgdHlwZVxyXG4gICAgICAgIGlmICghWydEQVRBLU9OTFknLCAnREFUQS1WT0lDRS1TTVMnXS5pbmNsdWRlcyhwYWNrYWdlVHlwZSkpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3NEMgSW52YWxpZCBwYWNrYWdlVHlwZTonLCBwYWNrYWdlVHlwZSk7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwMDtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ3BhY2thZ2VUeXBlIG11c3QgYmUgREFUQS1PTkxZIG9yIERBVEEtVk9JQ0UtU01TJyB9KSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QgcGFja2FnZXNVcmwgPSBgJHtFU0lNX0FQSV9CQVNFfS9wYWNrYWdlcy9jb3VudHJ5LyR7Y291bnRyeUlkfS8ke3BhY2thZ2VUeXBlfWA7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0U2IFBBQ0tBR0VTIEFQSTogTWFraW5nIHJlcXVlc3QgdG86JywgcGFja2FnZXNVcmwpO1xyXG5cclxuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgbWFrZUF1dGhlbnRpY2F0ZWRSZXF1ZXN0KHBhY2thZ2VzVXJsKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDRTUgUGFja2FnZXMgcmVzcG9uc2Ugc3RhdHVzOicsIHJlc3BvbnNlLnN0YXR1cyk7XHJcblxyXG4gICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgICBjb25zdCBlcnJvclRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBlU0lNIHBhY2thZ2VzIEFQSSBlcnJvcjonLCByZXNwb25zZS5zdGF0dXMsIGVycm9yVGV4dCk7XHJcbiAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gcmVzcG9uc2Uuc3RhdHVzO1xyXG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggcGFja2FnZXMnLCBkZXRhaWxzOiBlcnJvclRleHQgfSkpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDRTYgUEFDS0FHRVMgQVBJOiBSZXNwb25zZSBkYXRhOicsIGRhdGEpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENFNiBQQUNLQUdFUyBBUEk6IE51bWJlciBvZiBwYWNrYWdlczonLCBBcnJheS5pc0FycmF5KGRhdGEpID8gZGF0YS5sZW5ndGggOiAnTm90IGFuIGFycmF5Jyk7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIC8vIEhhbmRsZSB0aGUgQVBJIHJlc3BvbnNlIGZvcm1hdCAtIGV4dHJhY3QgdGhlIGFjdHVhbCBwYWNrYWdlcyBkYXRhXHJcbiAgICAgICAgICBsZXQgcGFja2FnZXMgPSBbXTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgaWYgKGRhdGEuc3RhdHVzICYmIGRhdGEuZGF0YSkge1xyXG4gICAgICAgICAgICBwYWNrYWdlcyA9IEFycmF5LmlzQXJyYXkoZGF0YS5kYXRhKSA/IGRhdGEuZGF0YSA6IFtdO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XHJcbiAgICAgICAgICAgIHBhY2thZ2VzID0gZGF0YTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBVbmV4cGVjdGVkIHBhY2thZ2VzIGRhdGEgZm9ybWF0OicsIGRhdGEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzA1IFBST0NFU1NFRCBQQUNLQUdFUyBDT1VOVDonLCBwYWNrYWdlcy5sZW5ndGgpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQwRCBGSVJTVCAzIFBBQ0tBR0VTOicsIEpTT04uc3RyaW5naWZ5KHBhY2thZ2VzLnNsaWNlKDAsIDMpLCBudWxsLCAyKSk7XHJcblxyXG4gICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkocGFja2FnZXMpKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIFBhY2thZ2VzIGVuZHBvaW50IGVycm9yOicsIGVycm9yKTtcclxuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xyXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJywgZGV0YWlsczogZXJyb3IubWVzc2FnZSB9KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFBhY2thZ2UgRGV0YWlscyBlbmRwb2ludFxyXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL2VzaW0vcGFja2FnZS1kZXRhaWxzJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENDQiBQYWNrYWdlIERldGFpbHMgZW5kcG9pbnQgY2FsbGVkJyk7XHJcblxyXG4gICAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnR0VUJykge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1Mjc0QyBXcm9uZyBtZXRob2Q6JywgcmVxLm1ldGhvZCk7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNTtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ01ldGhvZCBub3QgYWxsb3dlZCcgfSkpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChyZXEudXJsLCBgaHR0cDovLyR7cmVxLmhlYWRlcnMuaG9zdH1gKTtcclxuICAgICAgICBjb25zdCBwYWNrYWdlSWQgPSB1cmwuc2VhcmNoUGFyYW1zLmdldCgncGFja2FnZUlkJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENDQiBQQUNLQUdFIERFVEFJTFMgQVBJOiBSZWNlaXZlZCBwYWNrYWdlSWQ6JywgcGFja2FnZUlkKTtcclxuXHJcbiAgICAgICAgaWYgKCFwYWNrYWdlSWQpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3NEMgTm8gcGFja2FnZUlkIHBhcmFtZXRlciBwcm92aWRlZCcpO1xyXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDA7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdwYWNrYWdlSWQgcGFyYW1ldGVyIGlzIHJlcXVpcmVkJyB9KSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QgZGV0YWlsc1VybCA9IGAke0VTSU1fQVBJX0JBU0V9L3BhY2thZ2UvZGV0YWlsLyR7cGFja2FnZUlkfWA7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0NCIFBBQ0tBR0UgREVUQUlMUyBBUEk6IE1ha2luZyByZXF1ZXN0IHRvOicsIGRldGFpbHNVcmwpO1xyXG5cclxuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgbWFrZUF1dGhlbnRpY2F0ZWRSZXF1ZXN0KGRldGFpbHNVcmwpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENFNSBQYWNrYWdlIGRldGFpbHMgcmVzcG9uc2Ugc3RhdHVzOicsIHJlc3BvbnNlLnN0YXR1cyk7XHJcblxyXG4gICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgICBjb25zdCBlcnJvclRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBlU0lNIHBhY2thZ2UgZGV0YWlscyBBUEkgZXJyb3I6JywgcmVzcG9uc2Uuc3RhdHVzLCBlcnJvclRleHQpO1xyXG4gICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IHJlc3BvbnNlLnN0YXR1cztcclxuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHBhY2thZ2UgZGV0YWlscycsIGRldGFpbHM6IGVycm9yVGV4dCB9KSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENDQiBQQUNLQUdFIERFVEFJTFMgQVBJOiBSZXNwb25zZSBkYXRhOicsIGRhdGEpO1xyXG5cclxuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIFBhY2thZ2UgZGV0YWlscyBlbmRwb2ludCBlcnJvcjonLCBlcnJvcik7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDUwMDtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicsIGRldGFpbHM6IGVycm9yLm1lc3NhZ2UgfSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBQdXJjaGFzZSBQYWNrYWdlIGVuZHBvaW50XHJcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hcGkvZXNpbS9wdXJjaGFzZScsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDQjMgUHVyY2hhc2UgUGFja2FnZSBlbmRwb2ludCBjYWxsZWQnKTtcclxuXHJcbiAgICAgICAgaWYgKHJlcS5tZXRob2QgIT09ICdQT1NUJykge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1Mjc0QyBXcm9uZyBtZXRob2Q6JywgcmVxLm1ldGhvZCk7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNTtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ01ldGhvZCBub3QgYWxsb3dlZCcgfSkpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGJvZHkgPSAnJztcclxuICAgICAgICByZXEub24oJ2RhdGEnLCBjaHVuayA9PiB7XHJcbiAgICAgICAgICBib2R5ICs9IGNodW5rLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJlcS5vbignZW5kJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgeyBwYWNrYWdlSWQsIHBhY2thZ2VUeXBlIH0gPSBKU09OLnBhcnNlKGJvZHkpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENCMyBQVVJDSEFTRSBBUEk6IFJlY2VpdmVkIHBhY2thZ2VJZDonLCBwYWNrYWdlSWQpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0IzIFBVUkNIQVNFIEFQSTogUmVjZWl2ZWQgcGFja2FnZVR5cGU6JywgcGFja2FnZVR5cGUpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFwYWNrYWdlSWQpIHtcclxuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwMDtcclxuICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdwYWNrYWdlSWQgaXMgcmVxdWlyZWQnIH0pKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghcGFja2FnZVR5cGUpIHtcclxuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwMDtcclxuICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdwYWNrYWdlVHlwZSBpcyByZXF1aXJlZCAoREFUQS1PTkxZIG9yIERBVEEtVk9JQ0UtU01TKScgfSkpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVmFsaWRhdGUgcGFja2FnZSB0eXBlXHJcbiAgICAgICAgICAgIGlmICghWydEQVRBLU9OTFknLCAnREFUQS1WT0lDRS1TTVMnXS5pbmNsdWRlcyhwYWNrYWdlVHlwZSkpIHtcclxuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwMDtcclxuICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdwYWNrYWdlVHlwZSBtdXN0IGJlIERBVEEtT05MWSBvciBEQVRBLVZPSUNFLVNNUycgfSkpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHB1cmNoYXNlVXJsO1xyXG4gICAgICAgICAgICBsZXQgcmVxdWVzdEJvZHk7XHJcblxyXG4gICAgICAgICAgICBpZiAocGFja2FnZVR5cGUgPT09ICdEQVRBLU9OTFknKSB7XHJcbiAgICAgICAgICAgICAgLy8gRm9yIERBVEEtT05MWSBwYWNrYWdlc1xyXG4gICAgICAgICAgICAgIHB1cmNoYXNlVXJsID0gYCR7RVNJTV9BUElfQkFTRX0vcGFja2FnZS9wdXJjaGFzZT90ZXN0PXRydWVgO1xyXG4gICAgICAgICAgICAgIHJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICAgICAgICAgICAgcGFja2FnZV90eXBlX2lkOiBwYWNrYWdlSWRcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIC8vIEZvciBEQVRBLVZPSUNFLVNNUyBwYWNrYWdlc1xyXG4gICAgICAgICAgICAgIHB1cmNoYXNlVXJsID0gYCR7RVNJTV9BUElfQkFTRX0vcGFja2FnZS9kYXRlX3ZvaWNlX3Ntcy9wdXJjaGFzZWA7XHJcbiAgICAgICAgICAgICAgcmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgICAgICAgICAgICBwYWNrYWdlX3R5cGVfaWQ6IHBhY2thZ2VJZFxyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDQjMgUFVSQ0hBU0UgQVBJOiBNYWtpbmcgcmVxdWVzdCB0bzonLCBwdXJjaGFzZVVybCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDQjMgUFVSQ0hBU0UgQVBJOiBSZXF1ZXN0IGJvZHk6JywgcmVxdWVzdEJvZHkpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBtYWtlQXV0aGVudGljYXRlZFJlcXVlc3QocHVyY2hhc2VVcmwsIHtcclxuICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShyZXF1ZXN0Qm9keSlcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0U1IFB1cmNoYXNlIHJlc3BvbnNlIHN0YXR1czonLCByZXNwb25zZS5zdGF0dXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGVycm9yVGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcclxuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgZVNJTSBwdXJjaGFzZSBBUEkgZXJyb3I6JywgcmVzcG9uc2Uuc3RhdHVzLCBlcnJvclRleHQpO1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gcmVzcG9uc2Uuc3RhdHVzO1xyXG4gICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ0ZhaWxlZCB0byBwdXJjaGFzZSBwYWNrYWdlJywgZGV0YWlsczogZXJyb3JUZXh0IH0pKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDQjMgUFVSQ0hBU0UgQVBJOiBSZXNwb25zZSBkYXRhOicsIGRhdGEpO1xyXG5cclxuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XHJcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgUHVyY2hhc2UgZW5kcG9pbnQgZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDUwMDtcclxuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJywgZGV0YWlsczogZXJyb3IubWVzc2FnZSB9KSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gVXNlciBlU0lNcyBlbmRwb2ludCAtIHRoaXMgd291bGQgdHlwaWNhbGx5IHF1ZXJ5IHlvdXIgZGF0YWJhc2VcclxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaS91c2VyL2VzaW1zJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REM2NCBVc2VyIGVTSU1zIGVuZHBvaW50IGNhbGxlZCcpO1xyXG5cclxuICAgICAgICBpZiAocmVxLm1ldGhvZCAhPT0gJ0dFVCcpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3NEMgV3JvbmcgbWV0aG9kOicsIHJlcS5tZXRob2QpO1xyXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDU7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdNZXRob2Qgbm90IGFsbG93ZWQnIH0pKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0M0IFJldHVybmluZyBlbXB0eSBlU0lNcyBhcnJheSAobm8gdXNlciBzeXN0ZW0gaW50ZWdyYXRlZCB5ZXQpJyk7XHJcblxyXG4gICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlc2ltczogW10gfSkpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgVXNlciBlU0lNcyBlbmRwb2ludCBlcnJvcjonLCBlcnJvcik7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDUwMDtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicsIGRldGFpbHM6IGVycm9yLm1lc3NhZ2UgfSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxufSJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFIsU0FBUyxvQkFBb0I7QUFDelQsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUVqQixTQUFTLHVCQUF1Qjs7O0FDRmhDLElBQU0sZ0JBQWdCO0FBR3RCLElBQUksY0FBYztBQUNsQixJQUFJLGNBQWM7QUFHbEIsZUFBZSxpQkFBaUI7QUFDOUIsVUFBUSxJQUFJLG1DQUE0QjtBQUd4QyxNQUFJLGVBQWUsZUFBZSxLQUFLLElBQUksSUFBSSxhQUFhO0FBQzFELFlBQVEsSUFBSSwyQkFBc0I7QUFDbEMsV0FBTztBQUFBLEVBQ1Q7QUFHQSxNQUFJO0FBQ0YsWUFBUSxJQUFJLHFDQUE4QjtBQUMxQyxVQUFNLFdBQVcsR0FBRyxhQUFhO0FBQ2pDLFlBQVEsSUFBSSx3QkFBaUIsUUFBUTtBQUVyQyxVQUFNLFdBQVcsTUFBTSxNQUFNLFVBQVU7QUFBQSxNQUNyQyxRQUFRO0FBQUEsTUFDUixTQUFTO0FBQUEsUUFDUCxnQkFBZ0I7QUFBQSxRQUNoQixVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsTUFBTSxLQUFLLFVBQVU7QUFBQSxRQUNuQixPQUFPO0FBQUEsUUFDUCxVQUFVO0FBQUEsTUFD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
