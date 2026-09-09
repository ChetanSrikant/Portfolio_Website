import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ROUTE_SEO } from "../src/config/seo.js";
import { SITE_URL } from "../src/config/site.js";
import { validateOrigin, renderSeo } from "./seo.mjs";

const configuredUrl = process.env.SITE_URL || SITE_URL;
const origin = configuredUrl ? validateOrigin(configuredUrl) : "";
for (const [route, seo] of Object.entries(ROUTE_SEO)) {
  const html = readFileSync(`dist${route === "/" ? "" : route}/index.html`, "utf8");
  assert.equal((html.match(/<title>/g) || []).length, 1, `${route}: single title`);
  assert.equal((html.match(/rel="canonical"/g) || []).length, origin ? 1 : 0, `${route}: canonical count`);
  if (origin) assert(html.includes(`href="${origin}${route}"`), `${route}: canonical`);
  assert(html.includes(`content="${origin}/social-preview.png"`), `${route}: absolute social image`);
  for (const tag of ["description", "robots", "og:title", "og:description", "og:type", ...(origin ? ["og:url"] : []), "og:image", "twitter:card", "twitter:title", "twitter:description", "twitter:image"]) {
    assert.equal((html.match(new RegExp(`(?:name|property)="${tag}"`, "g")) || []).length, 1, `${route}: ${tag}`);
  }
  assert.equal(html.includes("noindex, follow"), Boolean(seo.noindex), `${route}: indexing`);
  assert.equal(html.includes('/images/hero-chetan-editorial.jpeg'), route === "/", `${route}: homepage-only image preload`);
  assert(html.includes('<div id="root"></div>') && html.includes('type="module"'), `${route}: app preserved`);
  assert.equal(renderSeo(html, route, origin), html, `${route}: idempotent metadata`);
  console.log(`PASS ${route}: initial HTML metadata`);
}
if (origin) {
const sitemap = readFileSync("dist/sitemap.xml", "utf8");
assert.equal((sitemap.match(/<url>/g) || []).length, 5);
assert(!sitemap.includes("credentials"));
assert(!sitemap.includes("404"));
}
const robots = readFileSync("dist/robots.txt", "utf8");
assert.equal(robots, `User-agent: *\nAllow: /\n${origin ? `\nSitemap: ${origin}/sitemap.xml\n` : ""}`);
const notFound = readFileSync("dist/404.html", "utf8");
assert(notFound.includes("noindex, follow"));
assert(!notFound.includes('rel="canonical"'));
assert(notFound.includes("Page Not Found"));
const png = readFileSync("public/social-preview.png");
assert.equal(png.readUInt32BE(16), 1200);
assert.equal(png.readUInt32BE(20), 630);
assert.throws(() => validateOrigin("https://example.com/path"));
assert.throws(() => validateOrigin("http://example.com"));
console.log("PASS robots, noindex 404, social image dimensions, origin validation");
console.log(origin ? "PASS sitemap and absolute canonical/social URLs" : "PENDING custom domain: canonical URLs, sitemap, and absolute social URLs");
