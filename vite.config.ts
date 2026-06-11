import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backend = "http://localhost:3000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/home": backend,
      "/login": backend,
      "/register": backend,
      "/branches": backend,
      "/customer-menu": backend,
      "/basket": backend,
      "/orders": backend,
      "/reservations": backend,
      "/dashboard": backend,
      "/menu": backend,
      "/inventory": backend,
      "/users": backend,
      "/reports": backend,
      "/logout": backend,
      "/reviews": backend,
      "/css": backend,
      "/images": backend,
      "/": backend,
    },
  },
});
