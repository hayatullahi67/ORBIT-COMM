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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL21pZGRsZXdhcmUvZXNpbS1hcGkuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx1c2VyXFxcXERlc2t0b3BcXFxcb3JiaXQtY29tbVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcdXNlclxcXFxEZXNrdG9wXFxcXG9yYml0LWNvbW1cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3VzZXIvRGVza3RvcC9vcmJpdC1jb21tL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcclxuaW1wb3J0IHsgZXNpbUFwaU1pZGRsZXdhcmUgfSBmcm9tIFwiLi9zcmMvbWlkZGxld2FyZS9lc2ltLWFwaS5qc1wiO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIHBvcnQ6IDgwODAsXHJcbiAgICBwcm94eToge1xyXG4gICAgICBcIi9hcGkvdGlnZXItc21zXCI6IHtcclxuICAgICAgICB0YXJnZXQ6IFwiaHR0cHM6Ly9hcGkudGlnZXItc21zLmNvbVwiLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICByZXdyaXRlOiBwYXRoID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaVxcL3RpZ2VyLXNtcy8sIFwiL3N0dWJzL2hhbmRsZXJfYXBpLnBocFwiKSxcclxuICAgICAgfSxcclxuXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIGVzaW1BcGlNaWRkbGV3YXJlKCksXHJcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmXHJcbiAgICBjb21wb25lbnRUYWdnZXIoKSxcclxuICBdLmZpbHRlcihCb29sZWFuKSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxufSkpO1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHVzZXJcXFxcRGVza3RvcFxcXFxvcmJpdC1jb21tXFxcXHNyY1xcXFxtaWRkbGV3YXJlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx1c2VyXFxcXERlc2t0b3BcXFxcb3JiaXQtY29tbVxcXFxzcmNcXFxcbWlkZGxld2FyZVxcXFxlc2ltLWFwaS5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvdXNlci9EZXNrdG9wL29yYml0LWNvbW0vc3JjL21pZGRsZXdhcmUvZXNpbS1hcGkuanNcIjsvLyBWaXRlIG1pZGRsZXdhcmUgZm9yIGhhbmRsaW5nIGVTSU0gQVBJIHJvdXRlc1xyXG5cclxuY29uc3QgRVNJTV9BUElfQkFTRSA9ICdodHRwczovL2VzaW1jYXJkLmNvbS9hcGkvZGV2ZWxvcGVyL3Jlc2VsbGVyJztcclxuXHJcbi8vIENhY2hlIGZvciBhY2Nlc3MgdG9rZW5cclxubGV0IGNhY2hlZFRva2VuID0gbnVsbDtcclxubGV0IHRva2VuRXhwaXJ5ID0gbnVsbDtcclxuXHJcbi8vIEZ1bmN0aW9uIHRvIGdldCBhY2Nlc3MgdG9rZW5cclxuYXN5bmMgZnVuY3Rpb24gZ2V0QWNjZXNzVG9rZW4oKSB7XHJcbiAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQxMCBHZXR0aW5nIGFjY2VzcyB0b2tlbi4uLicpO1xyXG5cclxuICAvLyBDaGVjayBpZiB3ZSBoYXZlIGEgdmFsaWQgY2FjaGVkIHRva2VuXHJcbiAgaWYgKGNhY2hlZFRva2VuICYmIHRva2VuRXhwaXJ5ICYmIERhdGUubm93KCkgPCB0b2tlbkV4cGlyeSkge1xyXG4gICAgY29uc29sZS5sb2coJ1x1MjcwNSBVc2luZyBjYWNoZWQgdG9rZW4nKTtcclxuICAgIHJldHVybiBjYWNoZWRUb2tlbjtcclxuICB9XHJcblxyXG4gIC8vIExvZ2luIHRvIGdldCBuZXcgdG9rZW5cclxuICB0cnkge1xyXG4gICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REU4MCBMb2dnaW5nIGluIHRvIGVTSU0gQVBJLi4uJyk7XHJcbiAgICBjb25zdCBsb2dpblVybCA9IGAke0VTSU1fQVBJX0JBU0V9L2xvZ2luYDtcclxuICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDRTEgTG9naW4gVVJMOicsIGxvZ2luVXJsKTtcclxuXHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGxvZ2luVXJsLCB7XHJcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nXHJcbiAgICAgIH0sXHJcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICBlbWFpbDogJ2pvaG5vbW9kaWFnYmU0NEBnbWFpbC5jb20nLFxyXG4gICAgICAgIHBhc3N3b3JkOiAnMjQ3c2ltLm5ldHFwQCMkJ1xyXG4gICAgICB9KVxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENFNSBMb2dpbiByZXNwb25zZSBzdGF0dXM6JywgcmVzcG9uc2Uuc3RhdHVzKTtcclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgIGNvbnN0IGVycm9yVGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcclxuICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIExvZ2luIGZhaWxlZDonLCByZXNwb25zZS5zdGF0dXMsIGVycm9yVGV4dCk7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTG9naW4gZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c30gLSAke2Vycm9yVGV4dH1gKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG4gICAgY29uc29sZS5sb2coJ1x1MjcwNSBMb2dpbiBzdWNjZXNzZnVsISBUb2tlbiByZWNlaXZlZDonLCBkYXRhLmFjY2Vzc190b2tlbiA/ICdZRVMnIDogJ05PJyk7XHJcbiAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0M0IEZ1bGwgbG9naW4gcmVzcG9uc2U6JywgZGF0YSk7XHJcblxyXG4gICAgY2FjaGVkVG9rZW4gPSBkYXRhLmFjY2Vzc190b2tlbjtcclxuXHJcbiAgICAvLyBDYWNoZSBmb3IgNTAgbWludXRlcyAoYXNzdW1pbmcgMSBob3VyIGV4cGlyeSlcclxuICAgIHRva2VuRXhwaXJ5ID0gRGF0ZS5ub3coKSArICg1MCAqIDYwICogMTAwMCk7XHJcblxyXG4gICAgcmV0dXJuIGNhY2hlZFRva2VuO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgZVNJTSBBUEkgbG9naW4gZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgdGhyb3cgZXJyb3I7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBGdW5jdGlvbiB0byBtYWtlIGF1dGhlbnRpY2F0ZWQgcmVxdWVzdHNcclxuYXN5bmMgZnVuY3Rpb24gbWFrZUF1dGhlbnRpY2F0ZWRSZXF1ZXN0KHVybCwgb3B0aW9ucyA9IHt9KSB7XHJcbiAgY29uc3QgdG9rZW4gPSBhd2FpdCBnZXRBY2Nlc3NUb2tlbigpO1xyXG5cclxuICByZXR1cm4gZmV0Y2godXJsLCB7XHJcbiAgICAuLi5vcHRpb25zLFxyXG4gICAgaGVhZGVyczoge1xyXG4gICAgICAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHt0b2tlbn1gLFxyXG4gICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAuLi5vcHRpb25zLmhlYWRlcnNcclxuICAgIH1cclxuICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGVzaW1BcGlNaWRkbGV3YXJlKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiAnZXNpbS1hcGktbWlkZGxld2FyZScsXHJcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XHJcbiAgICAgIC8vIENvdW50cmllcyBlbmRwb2ludFxyXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL2VzaW0vY291bnRyaWVzJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzQ1x1REYwRCBDb3VudHJpZXMgZW5kcG9pbnQgY2FsbGVkJyk7XHJcblxyXG4gICAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnR0VUJykge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1Mjc0QyBXcm9uZyBtZXRob2Q6JywgcmVxLm1ldGhvZCk7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNTtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ01ldGhvZCBub3QgYWxsb3dlZCcgfSkpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IGNvdW50cmllc1VybCA9IGAke0VTSU1fQVBJX0JBU0V9L3BhY2thZ2VzL2NvdW50cnlgO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENFMSBGZXRjaGluZyBjb3VudHJpZXMgZnJvbTonLCBjb3VudHJpZXNVcmwpO1xyXG5cclxuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgbWFrZUF1dGhlbnRpY2F0ZWRSZXF1ZXN0KGNvdW50cmllc1VybCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0U1IENvdW50cmllcyByZXNwb25zZSBzdGF0dXM6JywgcmVzcG9uc2Uuc3RhdHVzKTtcclxuXHJcbiAgICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVycm9yVGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIGVTSU0gY291bnRyaWVzIEFQSSBlcnJvcjonLCByZXNwb25zZS5zdGF0dXMsIGVycm9yVGV4dCk7XHJcbiAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gcmVzcG9uc2Uuc3RhdHVzO1xyXG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggY291bnRyaWVzJywgZGV0YWlsczogZXJyb3JUZXh0IH0pKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0M0IFJBVyBDT1VOVFJJRVMgREFUQSBGUk9NIEFQSTonLCBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKSk7XHJcblxyXG4gICAgICAgICAgLy8gSGFuZGxlIHRoZSBhY3R1YWwgQVBJIHJlc3BvbnNlIGZvcm1hdDoge3N0YXR1czogdHJ1ZSwgZGF0YToge2NvdW50cnlfbmFtZTogaXNvX2NvZGV9fVxyXG4gICAgICAgICAgbGV0IGNvdW50cmllcyA9IFtdO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBpZiAoZGF0YS5zdGF0dXMgJiYgZGF0YS5kYXRhKSB7XHJcbiAgICAgICAgICAgIC8vIFRoZSBkYXRhLmRhdGEgY29udGFpbnMgdGhlIGNvdW50cmllcyBvYmplY3RcclxuICAgICAgICAgICAgY291bnRyaWVzID0gT2JqZWN0LmVudHJpZXMoZGF0YS5kYXRhKS5tYXAoKFtuYW1lLCBpc29dKSA9PiAoeyBuYW1lLCBpc28gfSkpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoZGF0YSkpIHtcclxuICAgICAgICAgICAgLy8gRmFsbGJhY2s6IGlmIGl0J3MgYSBkaXJlY3Qgb2JqZWN0IHdpdGggY291bnRyaWVzXHJcbiAgICAgICAgICAgIGNvdW50cmllcyA9IE9iamVjdC5lbnRyaWVzKGRhdGEpLm1hcCgoW25hbWUsIGlzb10pID0+ICh7IG5hbWUsIGlzbyB9KSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgVW5leHBlY3RlZCBjb3VudHJpZXMgZGF0YSBmb3JtYXQ6JywgZGF0YSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3MDUgUFJPQ0VTU0VEIENPVU5UUklFUyBDT1VOVDonLCBjb3VudHJpZXMubGVuZ3RoKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdUREMEQgRklSU1QgNSBDT1VOVFJJRVM6JywgSlNPTi5zdHJpbmdpZnkoY291bnRyaWVzLnNsaWNlKDAsIDUpLCBudWxsLCAyKSk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNDXHVERjBEIFNFTkRJTkcgQ09VTlRSSUVTIFRPIEZST05URU5EOicsIEpTT04uc3RyaW5naWZ5KGNvdW50cmllcywgbnVsbCwgMikpO1xyXG5cclxuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KGNvdW50cmllcykpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgQ291bnRyaWVzIGVuZHBvaW50IGVycm9yOicsIGVycm9yKTtcclxuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xyXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJywgZGV0YWlsczogZXJyb3IubWVzc2FnZSB9KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFBhY2thZ2VzIGVuZHBvaW50XHJcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hcGkvZXNpbS9wYWNrYWdlcycsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDRTYgUGFja2FnZXMgZW5kcG9pbnQgY2FsbGVkJyk7XHJcblxyXG4gICAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnR0VUJykge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1Mjc0QyBXcm9uZyBtZXRob2Q6JywgcmVxLm1ldGhvZCk7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNTtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ01ldGhvZCBub3QgYWxsb3dlZCcgfSkpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChyZXEudXJsLCBgaHR0cDovLyR7cmVxLmhlYWRlcnMuaG9zdH1gKTtcclxuICAgICAgICBjb25zdCBjb3VudHJ5SWQgPSB1cmwuc2VhcmNoUGFyYW1zLmdldCgnY291bnRyeUlkJyk7XHJcbiAgICAgICAgY29uc3QgcGFja2FnZVR5cGUgPSB1cmwuc2VhcmNoUGFyYW1zLmdldCgncGFja2FnZVR5cGUnKTtcclxuICAgICAgICBcclxuICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0U2IFBBQ0tBR0VTIEFQSTogUmVjZWl2ZWQgY291bnRyeUlkOicsIGNvdW50cnlJZCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENFNiBQQUNLQUdFUyBBUEk6IFJlY2VpdmVkIHBhY2thZ2VUeXBlOicsIHBhY2thZ2VUeXBlKTtcclxuXHJcbiAgICAgICAgaWYgKCFjb3VudHJ5SWQpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3NEMgTm8gY291bnRyeUlkIHBhcmFtZXRlciBwcm92aWRlZCcpO1xyXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDA7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdjb3VudHJ5SWQgcGFyYW1ldGVyIGlzIHJlcXVpcmVkJyB9KSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXBhY2thZ2VUeXBlKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzRDIE5vIHBhY2thZ2VUeXBlIHBhcmFtZXRlciBwcm92aWRlZCcpO1xyXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDA7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdwYWNrYWdlVHlwZSBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQgKERBVEEtT05MWSBvciBEQVRBLVZPSUNFLVNNUyknIH0pKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFZhbGlkYXRlIHBhY2thZ2UgdHlwZVxyXG4gICAgICAgIGlmICghWydEQVRBLU9OTFknLCAnREFUQS1WT0lDRS1TTVMnXS5pbmNsdWRlcyhwYWNrYWdlVHlwZSkpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3NEMgSW52YWxpZCBwYWNrYWdlVHlwZTonLCBwYWNrYWdlVHlwZSk7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwMDtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ3BhY2thZ2VUeXBlIG11c3QgYmUgREFUQS1PTkxZIG9yIERBVEEtVk9JQ0UtU01TJyB9KSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QgcGFja2FnZXNVcmwgPSBgJHtFU0lNX0FQSV9CQVNFfS9wYWNrYWdlcy9jb3VudHJ5LyR7Y291bnRyeUlkfS8ke3BhY2thZ2VUeXBlfWA7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0U2IFBBQ0tBR0VTIEFQSTogTWFraW5nIHJlcXVlc3QgdG86JywgcGFja2FnZXNVcmwpO1xyXG5cclxuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgbWFrZUF1dGhlbnRpY2F0ZWRSZXF1ZXN0KHBhY2thZ2VzVXJsKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDRTUgUGFja2FnZXMgcmVzcG9uc2Ugc3RhdHVzOicsIHJlc3BvbnNlLnN0YXR1cyk7XHJcblxyXG4gICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgICBjb25zdCBlcnJvclRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBlU0lNIHBhY2thZ2VzIEFQSSBlcnJvcjonLCByZXNwb25zZS5zdGF0dXMsIGVycm9yVGV4dCk7XHJcbiAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gcmVzcG9uc2Uuc3RhdHVzO1xyXG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggcGFja2FnZXMnLCBkZXRhaWxzOiBlcnJvclRleHQgfSkpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDRTYgUEFDS0FHRVMgQVBJOiBSZXNwb25zZSBkYXRhOicsIGRhdGEpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENFNiBQQUNLQUdFUyBBUEk6IE51bWJlciBvZiBwYWNrYWdlczonLCBBcnJheS5pc0FycmF5KGRhdGEpID8gZGF0YS5sZW5ndGggOiAnTm90IGFuIGFycmF5Jyk7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIC8vIEhhbmRsZSB0aGUgQVBJIHJlc3BvbnNlIGZvcm1hdCAtIGV4dHJhY3QgdGhlIGFjdHVhbCBwYWNrYWdlcyBkYXRhXHJcbiAgICAgICAgICBsZXQgcGFja2FnZXMgPSBbXTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgaWYgKGRhdGEuc3RhdHVzICYmIGRhdGEuZGF0YSkge1xyXG4gICAgICAgICAgICBwYWNrYWdlcyA9IEFycmF5LmlzQXJyYXkoZGF0YS5kYXRhKSA/IGRhdGEuZGF0YSA6IFtdO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XHJcbiAgICAgICAgICAgIHBhY2thZ2VzID0gZGF0YTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBVbmV4cGVjdGVkIHBhY2thZ2VzIGRhdGEgZm9ybWF0OicsIGRhdGEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzA1IFBST0NFU1NFRCBQQUNLQUdFUyBDT1VOVDonLCBwYWNrYWdlcy5sZW5ndGgpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REQwRCBGSVJTVCAzIFBBQ0tBR0VTOicsIEpTT04uc3RyaW5naWZ5KHBhY2thZ2VzLnNsaWNlKDAsIDMpLCBudWxsLCAyKSk7XHJcblxyXG4gICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkocGFja2FnZXMpKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIFBhY2thZ2VzIGVuZHBvaW50IGVycm9yOicsIGVycm9yKTtcclxuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xyXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJywgZGV0YWlsczogZXJyb3IubWVzc2FnZSB9KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFBhY2thZ2UgRGV0YWlscyBlbmRwb2ludFxyXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL2VzaW0vcGFja2FnZS1kZXRhaWxzJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENDQiBQYWNrYWdlIERldGFpbHMgZW5kcG9pbnQgY2FsbGVkJyk7XHJcblxyXG4gICAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnR0VUJykge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1Mjc0QyBXcm9uZyBtZXRob2Q6JywgcmVxLm1ldGhvZCk7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNTtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ01ldGhvZCBub3QgYWxsb3dlZCcgfSkpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChyZXEudXJsLCBgaHR0cDovLyR7cmVxLmhlYWRlcnMuaG9zdH1gKTtcclxuICAgICAgICBjb25zdCBwYWNrYWdlSWQgPSB1cmwuc2VhcmNoUGFyYW1zLmdldCgncGFja2FnZUlkJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENDQiBQQUNLQUdFIERFVEFJTFMgQVBJOiBSZWNlaXZlZCBwYWNrYWdlSWQ6JywgcGFja2FnZUlkKTtcclxuXHJcbiAgICAgICAgaWYgKCFwYWNrYWdlSWQpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdTI3NEMgTm8gcGFja2FnZUlkIHBhcmFtZXRlciBwcm92aWRlZCcpO1xyXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDA7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdwYWNrYWdlSWQgcGFyYW1ldGVyIGlzIHJlcXVpcmVkJyB9KSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QgZGV0YWlsc1VybCA9IGAke0VTSU1fQVBJX0JBU0V9L3BhY2thZ2UvZGV0YWlsLyR7cGFja2FnZUlkfWA7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0NCIFBBQ0tBR0UgREVUQUlMUyBBUEk6IE1ha2luZyByZXF1ZXN0IHRvOicsIGRldGFpbHNVcmwpO1xyXG5cclxuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgbWFrZUF1dGhlbnRpY2F0ZWRSZXF1ZXN0KGRldGFpbHNVcmwpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENFNSBQYWNrYWdlIGRldGFpbHMgcmVzcG9uc2Ugc3RhdHVzOicsIHJlc3BvbnNlLnN0YXR1cyk7XHJcblxyXG4gICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgICBjb25zdCBlcnJvclRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBlU0lNIHBhY2thZ2UgZGV0YWlscyBBUEkgZXJyb3I6JywgcmVzcG9uc2Uuc3RhdHVzLCBlcnJvclRleHQpO1xyXG4gICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IHJlc3BvbnNlLnN0YXR1cztcclxuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIHBhY2thZ2UgZGV0YWlscycsIGRldGFpbHM6IGVycm9yVGV4dCB9KSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzRFx1RENDQiBQQUNLQUdFIERFVEFJTFMgQVBJOiBSZXNwb25zZSBkYXRhOicsIGRhdGEpO1xyXG5cclxuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcignXHUyNzRDIFBhY2thZ2UgZGV0YWlscyBlbmRwb2ludCBlcnJvcjonLCBlcnJvcik7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDUwMDtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicsIGRldGFpbHM6IGVycm9yLm1lc3NhZ2UgfSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBVc2VyIGVTSU1zIGVuZHBvaW50IC0gdGhpcyB3b3VsZCB0eXBpY2FsbHkgcXVlcnkgeW91ciBkYXRhYmFzZVxyXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL3VzZXIvZXNpbXMnLCBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQzY0IFVzZXIgZVNJTXMgZW5kcG9pbnQgY2FsbGVkJyk7XHJcblxyXG4gICAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnR0VUJykge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1x1Mjc0QyBXcm9uZyBtZXRob2Q6JywgcmVxLm1ldGhvZCk7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNTtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ01ldGhvZCBub3QgYWxsb3dlZCcgfSkpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdcdUQ4M0RcdURDQzQgUmV0dXJuaW5nIGVtcHR5IGVTSU1zIGFycmF5IChubyB1c2VyIHN5c3RlbSBpbnRlZ3JhdGVkIHlldCknKTtcclxuXHJcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVzaW1zOiBbXSB9KSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBVc2VyIGVTSU1zIGVuZHBvaW50IGVycm9yOicsIGVycm9yKTtcclxuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xyXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJywgZGV0YWlsczogZXJyb3IubWVzc2FnZSB9KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG59Il0sCiAgIm1hcHBpbmdzIjogIjtBQUE0UixTQUFTLG9CQUFvQjtBQUN6VCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBRWpCLFNBQVMsdUJBQXVCOzs7QUNGaEMsSUFBTSxnQkFBZ0I7QUFHdEIsSUFBSSxjQUFjO0FBQ2xCLElBQUksY0FBYztBQUdsQixlQUFlLGlCQUFpQjtBQUM5QixVQUFRLElBQUksbUNBQTRCO0FBR3hDLE1BQUksZUFBZSxlQUFlLEtBQUssSUFBSSxJQUFJLGFBQWE7QUFDMUQsWUFBUSxJQUFJLDJCQUFzQjtBQUNsQyxXQUFPO0FBQUEsRUFDVDtBQUdBLE1BQUk7QUFDRixZQUFRLElBQUkscUNBQThCO0FBQzFDLFVBQU0sV0FBVyxHQUFHLGFBQWE7QUFDakMsWUFBUSxJQUFJLHdCQUFpQixRQUFRO0FBRXJDLFVBQU0sV0FBVyxNQUFNLE1BQU0sVUFBVTtBQUFBLE1BQ3JDLFFBQVE7QUFBQSxNQUNSLFNBQVM7QUFBQSxRQUNQLGdCQUFnQjtBQUFBLFFBQ2hCLFVBQVU7QUFBQSxNQUNaO0FBQUEsTUFDQSxNQUFNLEtBQUssVUFBVTtBQUFBLFFBQ25CLE9BQU87QUFBQSxRQUNQLFVBQVU7QUFBQSxNQUNaLENBQUM7QUFBQSxJQUNILENBQUM7QUFFRCxZQUFRLElBQUksb0NBQTZCLFNBQVMsTUFBTTtBQUV4RCxRQUFJLENBQUMsU0FBUyxJQUFJO0FBQ2hCLFlBQU0sWUFBWSxNQUFNLFNBQVMsS0FB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
