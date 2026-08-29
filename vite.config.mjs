import path from "node:path";
import { fileURLToPath } from "node:url";
import { sites } from "@openai/sites-vite-plugin";
import { defineConfig } from "vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  publicDir: path.join(projectRoot, "outputs", "local-only", "g6", "public"),
  plugins: [sites()],
  build: {
    // Sites binds static files from dist/client while loading the Worker from
    // dist/server. Keeping those surfaces separate is required for ASSETS.
    outDir: "dist/client",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        home: path.join(projectRoot, "index.html"),
        app: path.join(projectRoot, "app", "index.html"),
        development: path.join(projectRoot, "development", "index.html"),
      },
    },
  },
});
