import fs from 'node:fs/promises';
const families = [ ['Space Grotesk', 'space-grotesk', '400;500;600;700'], ['Manrope', 'manrope', '400;500;600;700'], ['JetBrains Mono', 'jetbrains-mono', '400;500;600'] ];
await fs.mkdir('public/fonts', { recursive: true });
let css = '/* Local Latin subsets of the existing Google Fonts families. */\n';
for (const [family, slug, weights] of families) {
  const license = await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${slug.replaceAll('-', '')}/OFL.txt`);
  if (!license.ok) throw new Error(`Missing license for ${family}`);
  await fs.writeFile(`public/fonts/${slug}-OFL.txt`, await license.text());
  const response = await fetch(`https://fonts.googleapis.com/css2?family=${family.replaceAll(' ', '+')}:wght@${weights}&display=swap`, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' } });
  if (!response.ok) throw new Error(`Font CSS failed: ${response.status}`);
  const source = await response.text();
  const blocks = [...source.matchAll(/\/\* latin \*\/\s*(@font-face\s*\{[^}]+\})/g)];
  if (!blocks.length) throw new Error(`No Latin subset for ${family}`);
  const downloaded = new Map();
  for (const [, block] of blocks) {
    const url = block.match(/url\(([^)]+)\)/)[1];
    if (!downloaded.has(url)) {
      const name = `${slug}-${downloaded.size + 1}.woff2`;
      const file = await fetch(url);
      if (!file.ok) throw new Error(`Font download failed: ${file.status}`);
      await fs.writeFile(`public/fonts/${name}`, Buffer.from(await file.arrayBuffer()));
      downloaded.set(url, `/fonts/${name}`);
    }
    css += block.replace(url, downloaded.get(url)) + '\n';
  }
}
await fs.writeFile('src/fonts.css', css);
console.log('Local Latin font subsets prepared.');
