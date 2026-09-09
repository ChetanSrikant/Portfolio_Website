import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || 'sharp');
const files = [];
for (const directory of ['public/images/drift-wall', 'public/media/convocation-gallery']) {
  for (const name of await fs.readdir(directory)) if (/\.(png|jpe?g)$/i.test(name)) files.push(`${directory}/${name}`);
}
files.push('public/images/about-hero-campus.png', 'public/images/about-education-convocation.png', 'public/images/beyond/hyderabad-bridge.png', 'public/images/work/computer-vision/vision-detection-city.png', 'public/images/work/computer-vision/vision-detection-interior.png');
const manifest = {};
let originalBytes = 0, largestBytes = 0;
for (const file of files) {
  const meta = await sharp(file).metadata();
  const widths = file.includes('drift-wall') ? [240, 480] : [480, 960, 1440];
  const variants = [];
  for (const width of widths) {
    const target = `${file.replace(/\.[^.]+$/, '')}-${width}.webp`;
    await sharp(file).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toFile(target);
    const output = await sharp(target).metadata();
    variants.push({ src: target.replace(/^public/, ''), width: output.width, bytes: (await fs.stat(target)).size });
    if (width >= meta.width) break;
  }
  const last = variants.at(-1);
  manifest[file.replace(/^public/, '')] = { src: last.src, srcSet: variants.map(v => `${v.src} ${v.width}w`).join(', ') };
  originalBytes += (await fs.stat(file)).size;
  largestBytes += last.bytes;
}
await fs.writeFile('src/config/media-delivery.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ images: files.length, originalBytes, largestDeliveryBytes: largestBytes, savings: originalBytes - largestBytes }));
