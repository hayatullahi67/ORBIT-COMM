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
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  try {
    const response = await fetch(`${ESIM_API_BASE}/login`, {
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
    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }
    const data = await response.json();
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + 50 * 60 * 1e3;
    return cachedToken;
  } catch (error) {
    console.error("eSIM API login error:", error);
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
      server.middlewares.use("/api/esim/countries", async (req, res, next) => {
        if (req.method !== "GET") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        try {
          const response = await makeAuthenticatedRequest(`${ESIM_API_BASE}/packages/country`);
          if (!response.ok) {
            const errorText = await response.text();
            console.error("eSIM countries API error:", response.status, errorText);
            res.statusCode = response.status;
            res.end(JSON.stringify({ error: "Failed to fetch countries", details: errorText }));
            return;
          }
          const data = await response.json();
          const countries = Object.entries(data).map(([name, iso]) => ({ name, iso }));
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(countries));
        } catch (error) {
          console.error("Countries endpoint error:", error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Internal server error", details: error.message }));
        }
      });
      server.middlewares.use("/api/esim/packages", async (req, res, next) => {
        if (req.method !== "GET") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        const url = new URL(req.url, `http://${req.headers.host}`);
        const country = url.searchParams.get("country");
        if (!country) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "Country parameter is required" }));
          return;
        }
        try {
          const mockPackages = [
            {
              id: "pkg_001",
              name: `${country} 7-Day Plan`,
              data: "1GB",
              validity: "7 days",
              price: 9.99
            },
            {
              id: "pkg_002",
              name: `${country} 15-Day Plan`,
              data: "3GB",
              validity: "15 days",
              price: 19.99
            },
            {
              id: "pkg_003",
              name: `${country} 30-Day Plan`,
              data: "5GB",
              validity: "30 days",
              price: 29.99
            }
          ];
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(mockPackages));
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Internal server error", details: error.message }));
        }
      });
      server.middlewares.use("/api/user/esims", async (req, res, next) => {
        if (req.method !== "GET") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        try {
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
            }
          ];
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ esims: mockEsims }));
        } catch (error) {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL21pZGRsZXdhcmUvZXNpbS1hcGkuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx1c2VyXFxcXERlc2t0b3BcXFxcb3JiaXQtY29tbVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcdXNlclxcXFxEZXNrdG9wXFxcXG9yYml0LWNvbW1cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3VzZXIvRGVza3RvcC9vcmJpdC1jb21tL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcclxuaW1wb3J0IHsgZXNpbUFwaU1pZGRsZXdhcmUgfSBmcm9tIFwiLi9zcmMvbWlkZGxld2FyZS9lc2ltLWFwaS5qc1wiO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIHBvcnQ6IDgwODAsXHJcbiAgICBwcm94eToge1xyXG4gICAgICBcIi9hcGkvdGlnZXItc21zXCI6IHtcclxuICAgICAgICB0YXJnZXQ6IFwiaHR0cHM6Ly9hcGkudGlnZXItc21zLmNvbVwiLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICByZXdyaXRlOiBwYXRoID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaVxcL3RpZ2VyLXNtcy8sIFwiL3N0dWJzL2hhbmRsZXJfYXBpLnBocFwiKSxcclxuICAgICAgfSxcclxuXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIGVzaW1BcGlNaWRkbGV3YXJlKCksXHJcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmXHJcbiAgICBjb21wb25lbnRUYWdnZXIoKSxcclxuICBdLmZpbHRlcihCb29sZWFuKSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxufSkpO1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHVzZXJcXFxcRGVza3RvcFxcXFxvcmJpdC1jb21tXFxcXHNyY1xcXFxtaWRkbGV3YXJlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx1c2VyXFxcXERlc2t0b3BcXFxcb3JiaXQtY29tbVxcXFxzcmNcXFxcbWlkZGxld2FyZVxcXFxlc2ltLWFwaS5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvdXNlci9EZXNrdG9wL29yYml0LWNvbW0vc3JjL21pZGRsZXdhcmUvZXNpbS1hcGkuanNcIjsvLyBWaXRlIG1pZGRsZXdhcmUgZm9yIGhhbmRsaW5nIGVTSU0gQVBJIHJvdXRlc1xyXG5cclxuY29uc3QgRVNJTV9BUElfQkFTRSA9ICdodHRwczovL2VzaW1jYXJkLmNvbS9hcGkvZGV2ZWxvcGVyL3Jlc2VsbGVyJztcclxuXHJcbi8vIENhY2hlIGZvciBhY2Nlc3MgdG9rZW5cclxubGV0IGNhY2hlZFRva2VuID0gbnVsbDtcclxubGV0IHRva2VuRXhwaXJ5ID0gbnVsbDtcclxuXHJcbi8vIEZ1bmN0aW9uIHRvIGdldCBhY2Nlc3MgdG9rZW5cclxuYXN5bmMgZnVuY3Rpb24gZ2V0QWNjZXNzVG9rZW4oKSB7XHJcbiAgLy8gQ2hlY2sgaWYgd2UgaGF2ZSBhIHZhbGlkIGNhY2hlZCB0b2tlblxyXG4gIGlmIChjYWNoZWRUb2tlbiAmJiB0b2tlbkV4cGlyeSAmJiBEYXRlLm5vdygpIDwgdG9rZW5FeHBpcnkpIHtcclxuICAgIHJldHVybiBjYWNoZWRUb2tlbjtcclxuICB9XHJcblxyXG4gIC8vIExvZ2luIHRvIGdldCBuZXcgdG9rZW5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHtFU0lNX0FQSV9CQVNFfS9sb2dpbmAsIHtcclxuICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbidcclxuICAgICAgfSxcclxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgIGVtYWlsOiAnam9obm9tb2RpYWdiZTQ0QGdtYWlsLmNvbScsXHJcbiAgICAgICAgcGFzc3dvcmQ6ICcyNDdzaW0ubmV0cXBAIyQnXHJcbiAgICAgIH0pXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTG9naW4gZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG4gICAgY2FjaGVkVG9rZW4gPSBkYXRhLmFjY2Vzc190b2tlbjtcclxuICAgIFxyXG4gICAgLy8gQ2FjaGUgZm9yIDUwIG1pbnV0ZXMgKGFzc3VtaW5nIDEgaG91ciBleHBpcnkpXHJcbiAgICB0b2tlbkV4cGlyeSA9IERhdGUubm93KCkgKyAoNTAgKiA2MCAqIDEwMDApO1xyXG4gICAgXHJcbiAgICByZXR1cm4gY2FjaGVkVG9rZW47XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ2VTSU0gQVBJIGxvZ2luIGVycm9yOicsIGVycm9yKTtcclxuICAgIHRocm93IGVycm9yO1xyXG4gIH1cclxufVxyXG5cclxuLy8gRnVuY3Rpb24gdG8gbWFrZSBhdXRoZW50aWNhdGVkIHJlcXVlc3RzXHJcbmFzeW5jIGZ1bmN0aW9uIG1ha2VBdXRoZW50aWNhdGVkUmVxdWVzdCh1cmwsIG9wdGlvbnMgPSB7fSkge1xyXG4gIGNvbnN0IHRva2VuID0gYXdhaXQgZ2V0QWNjZXNzVG9rZW4oKTtcclxuICBcclxuICByZXR1cm4gZmV0Y2godXJsLCB7XHJcbiAgICAuLi5vcHRpb25zLFxyXG4gICAgaGVhZGVyczoge1xyXG4gICAgICAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHt0b2tlbn1gLFxyXG4gICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAuLi5vcHRpb25zLmhlYWRlcnNcclxuICAgIH1cclxuICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGVzaW1BcGlNaWRkbGV3YXJlKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiAnZXNpbS1hcGktbWlkZGxld2FyZScsXHJcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XHJcbiAgICAgIC8vIENvdW50cmllcyBlbmRwb2ludFxyXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL2VzaW0vY291bnRyaWVzJywgYXN5bmMgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XHJcbiAgICAgICAgaWYgKHJlcS5tZXRob2QgIT09ICdHRVQnKSB7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNTtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ01ldGhvZCBub3QgYWxsb3dlZCcgfSkpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgbWFrZUF1dGhlbnRpY2F0ZWRSZXF1ZXN0KGAke0VTSU1fQVBJX0JBU0V9L3BhY2thZ2VzL2NvdW50cnlgKTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgICBjb25zdCBlcnJvclRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ2VTSU0gY291bnRyaWVzIEFQSSBlcnJvcjonLCByZXNwb25zZS5zdGF0dXMsIGVycm9yVGV4dCk7XHJcbiAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gcmVzcG9uc2Uuc3RhdHVzO1xyXG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdGYWlsZWQgdG8gZmV0Y2ggY291bnRyaWVzJywgZGV0YWlsczogZXJyb3JUZXh0IH0pKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgICAgICBjb25zdCBjb3VudHJpZXMgPSBPYmplY3QuZW50cmllcyhkYXRhKS5tYXAoKFtuYW1lLCBpc29dKSA9PiAoeyBuYW1lLCBpc28gfSkpO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeShjb3VudHJpZXMpKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcignQ291bnRyaWVzIGVuZHBvaW50IGVycm9yOicsIGVycm9yKTtcclxuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xyXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJywgZGV0YWlsczogZXJyb3IubWVzc2FnZSB9KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFBhY2thZ2VzIGVuZHBvaW50IC0gdXNpbmcgbW9jayBkYXRhIGZvciBub3dcclxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaS9lc2ltL3BhY2thZ2VzJywgYXN5bmMgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XHJcbiAgICAgICAgaWYgKHJlcS5tZXRob2QgIT09ICdHRVQnKSB7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNTtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ01ldGhvZCBub3QgYWxsb3dlZCcgfSkpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChyZXEudXJsLCBgaHR0cDovLyR7cmVxLmhlYWRlcnMuaG9zdH1gKTtcclxuICAgICAgICBjb25zdCBjb3VudHJ5ID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoJ2NvdW50cnknKTtcclxuXHJcbiAgICAgICAgaWYgKCFjb3VudHJ5KSB7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwMDtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ0NvdW50cnkgcGFyYW1ldGVyIGlzIHJlcXVpcmVkJyB9KSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgLy8gTW9jayBwYWNrYWdlcyBkYXRhIGJhc2VkIG9uIGNvdW50cnlcclxuICAgICAgICAgIGNvbnN0IG1vY2tQYWNrYWdlcyA9IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGlkOiBcInBrZ18wMDFcIixcclxuICAgICAgICAgICAgICBuYW1lOiBgJHtjb3VudHJ5fSA3LURheSBQbGFuYCxcclxuICAgICAgICAgICAgICBkYXRhOiBcIjFHQlwiLFxyXG4gICAgICAgICAgICAgIHZhbGlkaXR5OiBcIjcgZGF5c1wiLFxyXG4gICAgICAgICAgICAgIHByaWNlOiA5Ljk5XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBpZDogXCJwa2dfMDAyXCIsIFxyXG4gICAgICAgICAgICAgIG5hbWU6IGAke2NvdW50cnl9IDE1LURheSBQbGFuYCxcclxuICAgICAgICAgICAgICBkYXRhOiBcIjNHQlwiLFxyXG4gICAgICAgICAgICAgIHZhbGlkaXR5OiBcIjE1IGRheXNcIixcclxuICAgICAgICAgICAgICBwcmljZTogMTkuOTlcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGlkOiBcInBrZ18wMDNcIixcclxuICAgICAgICAgICAgICBuYW1lOiBgJHtjb3VudHJ5fSAzMC1EYXkgUGxhbmAsXHJcbiAgICAgICAgICAgICAgZGF0YTogXCI1R0JcIiwgXHJcbiAgICAgICAgICAgICAgdmFsaWRpdHk6IFwiMzAgZGF5c1wiLFxyXG4gICAgICAgICAgICAgIHByaWNlOiAyOS45OVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICBdO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeShtb2NrUGFja2FnZXMpKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InLCBkZXRhaWxzOiBlcnJvci5tZXNzYWdlIH0pKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gVXNlciBlU0lNcyBlbmRwb2ludFxyXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL3VzZXIvZXNpbXMnLCBhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcclxuICAgICAgICBpZiAocmVxLm1ldGhvZCAhPT0gJ0dFVCcpIHtcclxuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDA1O1xyXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnTWV0aG9kIG5vdCBhbGxvd2VkJyB9KSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgLy8gTW9jayBkYXRhIGZvciBub3dcclxuICAgICAgICAgIGNvbnN0IG1vY2tFc2ltcyA9IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGlkOiAxLFxyXG4gICAgICAgICAgICAgIG5hbWU6IFwiRXVyb3BlIDMwLURheVwiLFxyXG4gICAgICAgICAgICAgIHBsYW46IFwiUHJlbWl1bSBFdXJvcGVcIiwgXHJcbiAgICAgICAgICAgICAgY291bnRyeTogXCJNdWx0aS1Db3VudHJ5XCIsXHJcbiAgICAgICAgICAgICAgcmVnaW9uOiBcIkV1cm9wZVwiLFxyXG4gICAgICAgICAgICAgIGRhdGFUb3RhbDogXCIxMEdCXCIsXHJcbiAgICAgICAgICAgICAgZGF0YVVzZWQ6IFwiMy4yR0JcIixcclxuICAgICAgICAgICAgICBkYXRhUmVtYWluaW5nOiBcIjYuOEdCXCIsXHJcbiAgICAgICAgICAgICAgc3RhdHVzOiBcIkFjdGl2ZVwiLFxyXG4gICAgICAgICAgICAgIGV4cGlyZXM6IFwiMjAyNC0xMS0xNVwiLFxyXG4gICAgICAgICAgICAgIGFjdGl2YXRlZDogXCIyMDI0LTEwLTE2XCIsXHJcbiAgICAgICAgICAgICAgc3BlZWQ6IFwiNUdcIixcclxuICAgICAgICAgICAgICBjb3VudHJpZXM6IFtcIkZyYW5jZVwiLCBcIkdlcm1hbnlcIiwgXCJJdGFseVwiLCBcIlNwYWluXCIsIFwiTmV0aGVybGFuZHNcIl0sXHJcbiAgICAgICAgICAgICAgcHJpY2U6IFwiJDI5Ljk5XCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVzaW1zOiBtb2NrRXNpbXMgfSkpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDUwMDtcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicsIGRldGFpbHM6IGVycm9yLm1lc3NhZ2UgfSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxufSJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFIsU0FBUyxvQkFBb0I7QUFDelQsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUVqQixTQUFTLHVCQUF1Qjs7O0FDRmhDLElBQU0sZ0JBQWdCO0FBR3RCLElBQUksY0FBYztBQUNsQixJQUFJLGNBQWM7QUFHbEIsZUFBZSxpQkFBaUI7QUFFOUIsTUFB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
