import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    outDir: "docs", // 👈 GitHub Pages requires /docs or / (root)
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [react(), tsconfigPaths()],
  base: "/circuit-smith/",
  server: {
    port: 5173,
    open: true,
  },
});