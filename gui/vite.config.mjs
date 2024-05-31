import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "~bootstrap": "node_modules/bootstrap",
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  root: "src",
});
