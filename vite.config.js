import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const STATIC_ROUTES = ["about", "work", "projects", "beyond", "credentials"];

function staticRouteEntries() {
  return {
    name: "static-route-entries",
    closeBundle() {
      const outputRoot = resolve("dist");
      const indexFile = resolve(outputRoot, "index.html");

      for (const route of STATIC_ROUTES) {
        const routeFile = resolve(outputRoot, route, "index.html");
        mkdirSync(dirname(routeFile), { recursive: true });
        copyFileSync(indexFile, routeFile);
      }

      copyFileSync(indexFile, resolve(outputRoot, "404.html"));
    },
  };
}

export default defineConfig({
  plugins: [react(), staticRouteEntries()],
  assetsInclude: ["**/*.glb"],
});
