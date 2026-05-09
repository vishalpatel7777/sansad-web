import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/features/**", "src/shared/**"],
      exclude: ["src/features/**/index.js", "**/*.config.*"],
    },
  },

  resolve: {
    alias: [
      // ── New modular-monolith aliases (specific paths first) ───────────────
      // More-specific entries must come before the generic "@/" prefix alias.
      { find: "@/app",      replacement: path.resolve(__dirname, "./src/app") },
      { find: "@/config",   replacement: path.resolve(__dirname, "./src/config") },
      { find: "@/shared",   replacement: path.resolve(__dirname, "./src/shared") },
      { find: "@/features", replacement: path.resolve(__dirname, "./src/features") },
      { find: "@/styles",   replacement: path.resolve(__dirname, "./src/styles") },
      { find: "@/lib",      replacement: path.resolve(__dirname, "./src/lib") },

      // Generic "@/" prefix — catches @/hooks/..., @/utils/..., etc.
      // Uses regex so it only matches paths that START with "@/".
      {
        find: /^@\/(.*)/,
        replacement: path.resolve(__dirname, "./src/$1"),
      },

      // ── Legacy aliases (kept for backward-compat — do NOT remove) ─────────
      // Existing imports like "@layout/Navbar" continue to resolve correctly.
      { find: "@layout",     replacement: path.resolve(__dirname, "./src/layout") },
      { find: "@components", replacement: path.resolve(__dirname, "./src/components") },
      { find: "@pages",      replacement: path.resolve(__dirname, "./src/pages") },
      { find: "@routes",     replacement: path.resolve(__dirname, "./src/routes") },
      { find: "@data",       replacement: path.resolve(__dirname, "./src/data") },
      { find: "@utils",      replacement: path.resolve(__dirname, "./src/utils") },
      { find: "@context",    replacement: path.resolve(__dirname, "./src/context") },
      { find: "@hooks",      replacement: path.resolve(__dirname, "./src/hooks") },
    ],
  },

  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
