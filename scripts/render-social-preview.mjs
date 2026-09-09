// Optional asset-authoring command; not needed by deployment builds.
// node scripts/render-social-preview.mjs [path-to-sharp]
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || "sharp");
await sharp("public/social-preview.svg").png({ compressionLevel: 9 }).toFile("public/social-preview.png");
console.log("Created public/social-preview.png (1200 x 630)");
