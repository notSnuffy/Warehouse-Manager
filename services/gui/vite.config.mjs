import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    host: true,
    watch: {
      usePolling: true,
    },
    allowedHosts: ["gui"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@scenes": path.resolve(__dirname, "./src/scenes"),
      "@shapes": path.resolve(__dirname, "./src/lib/shapes"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@managers": path.resolve(__dirname, "./src/lib/managers"),
      "@factories": path.resolve(__dirname, "./src/lib/factories"),
      "@utils": path.resolve(__dirname, "./src/lib/utils"),
      "@commands": path.resolve(__dirname, "./src/lib/commands"),
      "@ui": path.resolve(__dirname, "./src/lib/ui"),
    },
  },
  root: "src",
  appType: "mpa",
});
