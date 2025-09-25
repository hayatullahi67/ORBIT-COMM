// vite.config.ts
import { defineConfig } from "file:///C:/Users/user/Desktop/orbit-comm/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/user/Desktop/orbit-comm/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { loadEnv } from "file:///C:/Users/user/Desktop/orbit-comm/node_modules/vite/dist/node/index.js";
import { componentTagger } from "file:///C:/Users/user/Desktop/orbit-comm/node_modules/lovable-tagger/dist/index.js";
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
      },
      // New Proxy for eSIMCard API
      "/api/esim": {
        target: "https://portal.esimcard.com/api/developer/reseller",
        changeOrigin: true,
        rewrite: (path2) => path2.replace(/^\/api\/esim/, ""),
        configure: (proxy, options) => {
          const env = loadEnv(mode, process.cwd(), "");
          let accessToken = "";
          const loginToEsimApi = async () => {
            try {
              console.log("Logging in to eSIM API...");
              const response = await fetch("https://portal.esimcard.com/api/developer/reseller/login", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  email: env.ESIM_EMAIL,
                  password: env.ESIM_PASSWORD
                })
              });
              if (!response.ok) {
                console.error("eSIM API login failed:", response.status, response.statusText);
                const errorBody = await response.text();
                console.error("Error body:", errorBody);
                return;
              }
              const data = await response.json();
              accessToken = data.access_token;
              console.log("eSIM API login successful. Token acquired.");
            } catch (error) {
              console.error("Error during eSIM API login:", error);
            }
          };
          proxy.on("proxyReq", async (proxyReq, req, res) => {
            if (!accessToken) {
              await loginToEsimApi();
            }
            if (accessToken) {
              proxyReq.setHeader("Authorization", `Bearer ${accessToken}`);
            }
          });
        }
      }
    }
  },
  plugins: [
    react(),
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx1c2VyXFxcXERlc2t0b3BcXFxcb3JiaXQtY29tbVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcdXNlclxcXFxEZXNrdG9wXFxcXG9yYml0LWNvbW1cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3VzZXIvRGVza3RvcC9vcmJpdC1jb21tL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XHJcbiAgc2VydmVyOiB7XHJcbiAgICBob3N0OiBcIjo6XCIsXHJcbiAgICBwb3J0OiA4MDgwLFxyXG4gICAgcHJveHk6IHtcclxuICAgICAgXCIvYXBpL3RpZ2VyLXNtc1wiOiB7XHJcbiAgICAgICAgdGFyZ2V0OiBcImh0dHBzOi8vYXBpLnRpZ2VyLXNtcy5jb21cIixcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgcmV3cml0ZTogcGF0aCA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGlcXC90aWdlci1zbXMvLCBcIi9zdHVicy9oYW5kbGVyX2FwaS5waHBcIiksXHJcbiAgICAgIH0sXHJcbiAgICAgIC8vIE5ldyBQcm94eSBmb3IgZVNJTUNhcmQgQVBJXHJcbiAgICAgIFwiL2FwaS9lc2ltXCI6IHtcclxuICAgICAgICB0YXJnZXQ6IFwiaHR0cHM6Ly9wb3J0YWwuZXNpbWNhcmQuY29tL2FwaS9kZXZlbG9wZXIvcmVzZWxsZXJcIixcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaVxcL2VzaW0vLCBcIlwiKSxcclxuICAgICAgICBjb25maWd1cmU6IChwcm94eSwgb3B0aW9ucykgPT4ge1xyXG4gICAgICAgICAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XHJcbiAgICAgICAgICBsZXQgYWNjZXNzVG9rZW4gPSAnJztcclxuXHJcbiAgICAgICAgICBjb25zdCBsb2dpblRvRXNpbUFwaSA9IGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTG9nZ2luZyBpbiB0byBlU0lNIEFQSS4uLicpO1xyXG4gICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXCJodHRwczovL3BvcnRhbC5lc2ltY2FyZC5jb20vYXBpL2RldmVsb3Blci9yZXNlbGxlci9sb2dpblwiLCB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgICAgICAgICAgIGVtYWlsOiBlbnYuRVNJTV9FTUFJTCxcclxuICAgICAgICAgICAgICAgICAgcGFzc3dvcmQ6IGVudi5FU0lNX1BBU1NXT1JELFxyXG4gICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ2VTSU0gQVBJIGxvZ2luIGZhaWxlZDonLCByZXNwb25zZS5zdGF0dXMsIHJlc3BvbnNlLnN0YXR1c1RleHQpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JCb2R5ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgYm9keTonLCBlcnJvckJvZHkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuICAgICAgICAgICAgICBhY2Nlc3NUb2tlbiA9IGRhdGEuYWNjZXNzX3Rva2VuO1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdlU0lNIEFQSSBsb2dpbiBzdWNjZXNzZnVsLiBUb2tlbiBhY3F1aXJlZC4nKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBkdXJpbmcgZVNJTSBBUEkgbG9naW46JywgZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcScsIGFzeW5jIChwcm94eVJlcSwgcmVxLCByZXMpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFhY2Nlc3NUb2tlbikge1xyXG4gICAgICAgICAgICAgIGF3YWl0IGxvZ2luVG9Fc2ltQXBpKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGFjY2Vzc1Rva2VuKSB7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEuc2V0SGVhZGVyKCdBdXRob3JpemF0aW9uJywgYEJlYXJlciAke2FjY2Vzc1Rva2VufWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiZcclxuICAgIGNvbXBvbmVudFRhZ2dlcigpLFxyXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgfSxcclxuICB9LFxyXG59KSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFIsU0FBUyxvQkFBb0I7QUFDelQsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLGVBQWU7QUFDeEIsU0FBUyx1QkFBdUI7QUFKaEMsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxrQkFBa0I7QUFBQSxRQUNoQixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxTQUFTLENBQUFBLFVBQVFBLE1BQUssUUFBUSxxQkFBcUIsd0JBQXdCO0FBQUEsTUFDN0U7QUFBQTtBQUFBLE1BRUEsYUFBYTtBQUFBLFFBQ1gsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDQSxVQUFTQSxNQUFLLFFBQVEsZ0JBQWdCLEVBQUU7QUFBQSxRQUNsRCxXQUFXLENBQUMsT0FBTyxZQUFZO0FBQzdCLGdCQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFDM0MsY0FBSSxjQUFjO0FBRWxCLGdCQUFNLGlCQUFpQixZQUFZO0FBQ2pDLGdCQUFJO0FBQ0Ysc0JBQVEsSUFBSSwyQkFBMkI7QUFDdkMsb0JBQU0sV0FBVyxNQUFNLE1BQU0sNERBQTREO0FBQUEsZ0JBQ3ZGLFFBQVE7QUFBQSxnQkFDUixTQUFTO0FBQUEsa0JBQ1AsZ0JBQWdCO0FBQUEsZ0JBQ2xCO0FBQUEsZ0JBQ0EsTUFBTSxLQUFLLFVBQVU7QUFBQSxrQkFDbkIsT0FBTyxJQUFJO0FBQUEsa0JBQ1gsVUFBVSxJQUFJO0FBQUEsZ0JBQ2hCLENBQUM7QUFBQSxjQUNILENBQUM7QUFFRCxrQkFBSSxDQUFDLFNBQVMsSUFBSTtBQUNoQix3QkFBUSxNQUFNLDBCQUEwQixTQUFTLFFBQVEsU0FBUyxVQUFVO0FBQzVFLHNCQUFNLFlBQVksTUFBTSxTQUFTLEtBQUs7QUFDdEMsd0JBQVEsTUFBTSxlQUFlLFNBQVM7QUFDdEM7QUFBQSxjQUNGO0FBRUEsb0JBQU0sT0FBTyxNQUFNLFNBQVMsS0FBSztBQUNqQyw0QkFBYyxLQUFLO0FBQ25CLHNCQUFRLElBQUksNENBQTRDO0FBQUEsWUFDMUQsU0FBUyxPQUFPO0FBQ2Qsc0JBQVEsTUFBTSxnQ0FBZ0MsS0FBSztBQUFBLFlBQ3JEO0FBQUEsVUFDRjtBQUVBLGdCQUFNLEdBQUcsWUFBWSxPQUFPLFVBQVUsS0FBSyxRQUFRO0FBQ2pELGdCQUFJLENBQUMsYUFBYTtBQUNoQixvQkFBTSxlQUFlO0FBQUEsWUFDdkI7QUFDQSxnQkFBSSxhQUFhO0FBQ2YsdUJBQVMsVUFBVSxpQkFBaUIsVUFBVSxXQUFXLEVBQUU7QUFBQSxZQUM3RDtBQUFBLFVBQ0YsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFNBQVMsaUJBQ1QsZ0JBQWdCO0FBQUEsRUFDbEIsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUNoQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFsicGF0aCJdCn0K
