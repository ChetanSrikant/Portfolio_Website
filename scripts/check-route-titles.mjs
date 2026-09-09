import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ROUTE_SEO, NOT_FOUND_SEO, normalizePagePath, getRouteSeo } from "../src/config/seo.js";
import { getHtmlRoute, renderSeo } from "./seo.mjs";

const html = readFileSync("index.html", "utf8");
for (const request of ["/", "/index.html", "/?ref=test", "/index.html?ref=test#top"]) {
  const route = getHtmlRoute({ server: {}, path: "/index.html", originalUrl: request });
  assert.equal(route, "/");
  assert.equal(getRouteSeo(request), ROUTE_SEO["/"]);
  const rendered = renderSeo(html, route, "");
  assert(rendered.includes("<title>Chetan&#39;s Portfolio</title>"));
  assert(!rendered.includes("Page Not Found"));
  assert(!rendered.includes("noindex"));
}
for (const route of Object.keys(ROUTE_SEO).filter(path => path !== "/")) {
  assert.equal(normalizePagePath(`${route}/index.html`), route);
  assert.equal(getHtmlRoute({ server: {}, path: "/index.html", originalUrl: `${route}?ref=test` }), route);
  assert.equal(getRouteSeo(`${route}/`), ROUTE_SEO[route]);
}
const missing = getHtmlRoute({ server: {}, path: "/index.html", originalUrl: "/missing-page?ref=test" });
assert.equal(getRouteSeo(missing), NOT_FOUND_SEO);
assert(renderSeo(html, missing, "").includes("noindex, follow"));
assert.equal(getHtmlRoute({ server: {}, path: "/index.html" }), "/");
assert.equal(getHtmlRoute({ path: "/index.html" }), "/");
console.log("PASS: home aliases, query strings, secondary pages, genuine 404s, and Vite HTML rewrite handling");
