import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { SITE_URL } from "./src/config/site.js";
import { ROUTE_SEO } from "./src/config/seo.js";
import { getHtmlRoute, renderSeo, renderSitemap, renderRobots, validateOrigin } from "./scripts/seo.mjs";

function staticRouteEntries() {
  let outputRoot;
  let origin;
  return {
    name: "static-route-entries",
    configResolved(config) {
      outputRoot = resolve(config.root, config.build.outDir);
      const siteUrl = process.env.SITE_URL || SITE_URL;
      origin = siteUrl ? validateOrigin(siteUrl) : "";
      if (!origin) config.logger.warn("SEO: custom domain pending; canonical URLs and sitemap will be omitted until SITE_URL is configured.");
    },
    transformIndexHtml(html, context) {
      return renderSeo(html, getHtmlRoute(context), origin);
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = new URL(req.url, "http://localhost").pathname;
        if (pathname !== "/robots.txt" && pathname !== "/sitemap.xml") return next();
        if (pathname === "/sitemap.xml" && !origin) {
          res.statusCode = 404;
          res.end("Sitemap unavailable until the public domain is configured.");
          return;
        }
        res.setHeader("Content-Type", pathname === "/robots.txt" ? "text/plain; charset=utf-8" : "application/xml; charset=utf-8");
        res.end(pathname === "/robots.txt" ? renderRobots(origin) : renderSitemap(origin));
      });
    },
    closeBundle() {
      const indexFile = resolve(outputRoot, "index.html");
      const html = readFileSync(indexFile, "utf8");

      for (const route of Object.keys(ROUTE_SEO)) {
        const routeFile = resolve(outputRoot, route.slice(1), "index.html");
        mkdirSync(dirname(routeFile), { recursive: true });
        writeFileSync(routeFile, renderSeo(html, route, origin));
      }

      writeFileSync(resolve(outputRoot, "404.html"), renderSeo(html, "/404", origin));
      writeFileSync(resolve(outputRoot, "robots.txt"), renderRobots(origin));
      if (origin) writeFileSync(resolve(outputRoot, "sitemap.xml"), renderSitemap(origin));
    },
  };
}

export default defineConfig({
  plugins: [react(), staticRouteEntries()],
  assetsInclude: ["**/*.glb"],
});
