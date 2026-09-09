"""Generate fallback faces using measured x-height and vertical font metrics."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path('tmp/media-tools').resolve()))
from fontTools.ttLib import TTFont

faces = [('space-grotesk', 'Space Grotesk Fallback', 'Arial', 'arial.ttf'), ('manrope', 'Manrope Fallback', 'Arial', 'arial.ttf'), ('jetbrains-mono', 'JetBrains Mono Fallback', 'Courier New', 'cour.ttf')]
css = '/* Fallbacks measured from the delivered fonts and Windows system fonts. */\n'
for slug, name, local, filename in faces:
    target = TTFont(f'public/fonts/{slug}-1.woff2')
    fallback = TTFont(f'C:/Windows/Fonts/{filename}')
    unit = target['head'].unitsPerEm
    scale = (target['OS/2'].sxHeight / unit) / (fallback['OS/2'].sxHeight / fallback['head'].unitsPerEm)
    hhea = target['hhea']
    css += f'''@font-face {{
  font-family: '{name}';
  src: local('{local}');
  size-adjust: {scale * 100:.4f}%;
  ascent-override: {hhea.ascent / unit / scale * 100:.4f}%;
  descent-override: {abs(hhea.descent) / unit / scale * 100:.4f}%;
  line-gap-override: {hhea.lineGap / unit / scale * 100:.4f}%;
}}
'''
Path('src/font-fallbacks.css').write_text(css)
print(css)
