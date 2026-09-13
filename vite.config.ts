import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === "true" ? "/NebulaDice-Browser/" : "/",
  server: {
    host: "127.0.0.1",
    port: 5173
  },
  test: {
    environment: "happy-dom",
    globals: true
  }
});
