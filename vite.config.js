import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "/wedding-ra/",
  plugins: [react()],
  server: {
    host: "127.0.0.1"
  },
  preview: {
    host: "127.0.0.1"
  },
  build: {
    rollupOptions: {
      output: {
        // JS bundle
        entryFileNames: "assets/js/[name]-[hash].js",
        chunkFileNames: "assets/js/[name]-[hash].js",
        // CSS
        assetFileNames(assetInfo) {
          const name = assetInfo.names?.[0] ?? assetInfo.name ?? "";
          const ext = path.extname(name).toLowerCase();

          if ([".woff", ".woff2", ".ttf", ".otf"].includes(ext)) {
            return "assets/fonts/[name]-[hash][extname]";
          }
          if ([".webp", ".jpg", ".jpeg", ".png", ".gif", ".svg"].includes(ext)) {
            // photos vs ui icons
            const base = path.basename(name, ext);
            const isUi = ["flourish", "ornament", "music", "texture", "logo"].some((k) =>
              base.toLowerCase().includes(k)
            );
            return isUi ? "assets/ui/[name]-[hash][extname]" : "assets/photos/[name]-[hash][extname]";
          }
          if (ext === ".mp3" || ext === ".ogg" || ext === ".wav") {
            return "assets/audio/[name]-[hash][extname]";
          }
          if (ext === ".css") {
            return "assets/css/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
});
