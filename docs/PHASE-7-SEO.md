# Phase 7 — SEO and sharing

## Implemented

- Build-time titles, descriptions, robots directives, Open Graph and Twitter metadata for Home, About, Work, Projects, Beyond, Credentials, and the missing-page shell. Metadata is in the initial HTML; this is not full content prerendering.
- A shared route metadata source in `src/config/seo.js`; internal-page browser titles use the same source.
- A deliberately typeset, dark/amber 1200 × 630 PNG social preview (37,056 bytes), with editable SVG source and optional rendering script. No new runtime dependency.
- A real plain-text `robots.txt` generated into `dist` and served by the dev server.
- Sitemap generation for the five stable public pages. Credentials remains accessible but has `noindex, follow` and is excluded from the sitemap until ready.
- A separate noindex `404.html`, without a misleading home canonical. Vercel is explicitly configured as a static build with no catch-all home rewrite; unmatched paths should use that file with HTTP 404. The existing Gundam missing-page UI is unchanged.
- Home portrait preload removed from secondary-route HTML only.

## Custom domain required

The owner confirmed using a custom domain, but has not yet supplied its URL. Set the exact preferred HTTPS origin in `src/config/site.js` or pass `SITE_URL` as a build environment variable. Until then, builds intentionally omit canonicals, `og:url`, and the sitemap instead of publishing the wrong domain; social-image references are temporarily root-relative.

Once configured, rebuild and run `node scripts/check-seo.mjs`. Generated canonical, Open Graph, image, robots sitemap, and sitemap entry URLs will all use the same validated origin. Route canonicals omit trailing slashes, query strings, and hash fragments (the root retains `/`).

## Deployment checks still required

Local validation: `npm run build` passed (existing large-chunk warnings remain). `node scripts/check-seo.mjs` passed the configured-domain-independent checks for all six pages, robots content, noindex 404, and preview dimensions. Renderer idempotency and five-route sitemap generation also passed using a test-only example origin without writing deployment artifacts. The preview PNG was visually inspected. Canonical and absolute-URL integration checks remain pending the domain.

No deployment was performed. Verify the actual custom domain after deployment:

1. `/`, `/about`, `/work`, `/projects`, `/beyond`, and `/credentials` return their route-specific HTML, not the home shell. Inspect View Source with JavaScript disabled.
2. `/robots.txt` returns text/plain; `/sitemap.xml` returns XML with five URLs; `/social-preview.png` returns image/png; `/resume.pdf` still returns a PDF.
3. An arbitrary unknown path returns HTTP 404 and renders the existing Gundam playground. Vite's local SPA preview fallback is not proof of production status handling.
4. Set hosting-level redirects from alternate domains to the preferred origin if those domains are attached. Canonical tags do not perform redirects.
5. Check a freshly scraped link preview; platforms may cache previous images and metadata.

Hosting reference: [Vercel custom 404 pages](https://vercel.com/kb/guide/custom-404-page). The old Vercel endpoint could not be reached from the restricted shell during this pass; the new custom domain is needed for the relevant production check.
