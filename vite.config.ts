import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { loadEnv } from 'vite';
import { componentTagger } from "lovable-tagger";
import { esimApiMiddleware } from "./src/middleware/esim-api.js";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api/tiger-sms": {
        target: "https://api.tiger-sms.com",
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/tiger-sms/, "/stubs/handler_api.php"),
      },

    },
  },
  plugins: [
    react(),
    esimApiMiddleware(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
