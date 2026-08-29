import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    outDir: "dist/server",
    emptyOutDir: false,
    sourcemap: false,
    minify: true,
    ssr: path.join(projectRoot, "worker", "index.mjs"),
    rollupOptions: {
      output: {
        entryFileNames: "index.js",
        format: "es",
      },
    },
  },
});
