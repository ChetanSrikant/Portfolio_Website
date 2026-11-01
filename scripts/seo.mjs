import { ROUTE_SEO, getRouteSeo, normalizePagePath } from "../src/config/seo.js";

export function getHtmlRoute(context) {
  // Vite rewrites SPA requests to /index.html before transforming the HTML.
  // Keep the original request so real missing routes still receive 404 metadata.
  return context.server ? normalizePagePath(context.originalUrl || context.path) : "/";
}

export function validateOrigin(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.pathname !== "/" || url.search || url.hash || url.username || url.password) {
    throw new Error("The SEO site URL must be an HTTPS origin without a path, credentials, query, or fragment.");
  }
  return url.origin;
}

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);

export function renderSeo(html, pathname, origin) {
  const path = normalizePagePath(pathname);
  const page = getRouteSeo(path);
  const known = Object.hasOwn(ROUTE_SEO, path);
  const meta = (name, value, property = false) => `    <meta ${property ? "property" : "name"}="${name}" content="${escapeHtml(value)}" />`;
  const image = `${origin}/social-preview.png`;
  const tags = [
    `    <title>${escapeHtml(page.title)}</title>`,
    meta("description", page.description),
    meta("robots", page.noindex ? "noindex, follow" : "index, follow, max-image-preview:large"),
    ...(known && origin ? [`    <link rel="canonical" href="${origin}${path}" />`] : []),
    meta("og:title", page.title, true),
    meta("og:description", page.description, true),
    meta("og:type", "website", true),
    meta("og:site_name", "Chetan Srikant Mandiga", true),
    ...(known && origin ? [meta("og:url", `${origin}${path}`, true)] : []),
    meta("og:image", image, true),
    meta("og:image:type", "image/png", true),
    meta("og:image:width", "1200", true),
    meta("og:image:height", "630", true),
    meta("og:image:alt", "Chetan Srikant Mandiga — Data Science & Software Engineering", true),
    meta("twitter:card", "summary_large_image"),
    meta("twitter:title", page.title),
    meta("twitter:description", page.description),
    meta("twitter:image", image),
    meta("twitter:image:alt", "Chetan Srikant Mandiga — Data Science & Software Engineering"),
  ].join("\n");
  let result = html.replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, `<!-- SEO:START -->\n${tags}\n    <!-- SEO:END -->`);
  if (path !== "/") result = result.replace(/\s*<link[^>]+href="\/images\/hero-chetan-editorial.jpeg"[^>]*>/, "");
  return result;
}

export function renderSitemap(origin) {
  const urls = Object.entries(ROUTE_SEO).filter(([, page]) => !page.noindex)
    .map(([path]) => `  <url><loc>${escapeHtml(origin + path)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function renderRobots(origin) {
  // Leave credentials crawlable so its noindex directive can be read.
  return `User-agent: *\nAllow: /\n${origin ? `\nSitemap: ${origin}/sitemap.xml\n` : ""}`;
}
