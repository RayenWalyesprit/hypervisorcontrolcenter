import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0", // Exposes the server to the network
    port: 5173,       // Default port
    open: true,       // Automatically open the browser
    strictPort: true, // Prevent the server from choosing a different port
  },
});
