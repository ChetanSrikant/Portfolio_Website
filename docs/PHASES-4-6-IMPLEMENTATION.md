# Phases 4–6 implementation — 8 September 2026

## Homepage loading

- Home now observes the stage region before importing GundamStage. The first screen renders without a Canvas. Removing Hero's import from the Three.js-backed choreography configuration also removes an eager path into Three.js. Its work button now targets the existing selected-work section directly.
- The loading section uses the real stage CSS, editorial content, lead spacer and playground spacer. Anchors and content remain available while loading. Settled placeholder and mounted section dimensions matched in mobile and desktop checks. Initial text/font/reveal settling can still change document height; this is not a claim of zero CLS.
- Removed the Gundam GLB module-level preload. Contact shadows, model initialization and other Canvas work begin with the stage.
- The Canvas uses continuous rendering while visible and stops while its section is offscreen or the tab is hidden. Continuous rendering remains necessary for the authored idle/action/scroll animations; no blanket demand-mode change was made.
- Added a WeakSet guard to model normalization. Camera readiness could rerun the normalization effect against an already scaled cached GLTF, producing an oversized model. Normalization now runs once per scene. Model file, clips, scale constants and choreography paths are unchanged.

## Media delivery

Original source media remains in place. New copies and variants are selected by the image delivery manifest and ResponsiveImage component.

| Media | Original bytes | Largest delivery copies, bytes |
| --- | ---: | ---: |
| 33 images: Drift Wall, About campus/education/gallery, Hyderabad bridge, two Work detection images | 14,945,384 | 3,989,440 |
| Tech-stack video | 16,039,708 | 1,094,836 |
| Convocation video | 5,037,359 | 3,689,300 |

These alternative delivery copies total approximately 27.25 MB less than their originals across the inventory. They are not the transfer of one page. Responsive choices can use smaller variants. Since originals are preserved in public, total repository/deployment storage has increased rather than decreased.

- Drift Wall uses 240/480 WebP variants with srcset; its repeated tile subtree mounts only near the skills sequence.
- About and gallery images use 480/960/1440 variants where the original dimensions support them. Hero photography stays eager; gallery imagery stays lazy.
- Existing Beyond display WebPs were already compact and remain in use. The remaining bridge PNG now uses responsive WebP delivery through ProgressiveImage.
- Work's two supplied detection PNGs use WebP copies.
- The tech-stack video has a poster, no source before approaching visibility, and pauses offscreen/when the tab is hidden. Existing reduced-motion controls are retained.
- Convocation retains its original resolution, frame rate and audio in an H.264/AAC delivery copy with faststart. Tech-stack delivery uses H.264 at 960px width with faststart, omitting unused audio for the existing muted presentation. No extra WebM copy was necessary for this compatibility target.

## Fonts and CSS

- Space Grotesk, Manrope and JetBrains Mono retain their existing requested weights and display=swap, now served from three local Latin WOFF2 files totaling 78,556 bytes. Font licenses are included.
- Removed the external Google Fonts stylesheet and preconnects from index.html. Preload the two principal fonts and existing eager Home portrait.
- Local Arial/Courier New fallback faces use x-height and vertical metrics measured from the delivered fonts and local Windows fonts. Other systems without those local fonts retain generic fallbacks.
- Removed both full ThreeUI stylesheet imports (GundamStage and About). The only imported library component is ConstellationField; its implementation supplies inline iframe geometry and a self-contained srcDoc. CursorReactiveConstellationField supplies CSS Modules for its frames. No full-library CSS selectors are needed for these consumers. The 73.99 kB raw / 26.46 kB gzip stylesheet is absent from the resulting build.
- Kept the ThreeUI dependency and light-theme tokens. Neither needed speculative removal.

## Verification and limits

- Production build passed; existing >500 kB warnings remain for the 3D and About chunks.
- Live Home: no Canvas initially; Canvas appears after entering the stage; direct Work CTA reaches selected-work; settled section dimensions match before/after loading. Model size visually checked on mobile and desktop after the normalization guard.
- Live About: optimized campus/education images load; the tech-stack source is absent initially, plays near view and pauses after leaving; constellation and Paper iframes remain present.
- Live Work: both detection images use their WebP paths. Live Beyond: bridge responsive image loads successfully.
- No console warnings/errors recorded in the final sampled route checks. No changes in src/shaders/3d-paper or CursorReactiveConstellationField.
- No new Lighthouse score, Safari/Firefox result, physical-device result, GPU-memory soak result or complete choreography comparison is claimed. Those remain in the roadmap's deployment-validation phase. The earlier Phase 3 static-mode work was not completed by these loading changes; explicit static/keyboard-rotation controls are separate accessibility work.

## Reproduction

- `scripts/optimize-media.mjs` accepts a path to the sharp package, generates delivery variants and src/config/media-delivery.json. It preserves originals.
- `scripts/prepare-fonts.mjs` downloads the selected Latin subsets and official licenses.
- `scripts/font-metrics.py` uses fontTools with WOFF support and Windows Arial/Courier New to generate fallback CSS. Temporary tooling was installed under ignored tmp/media-tools.
- FFmpeg: tech-stack uses scale=960:-2, libx264, CRF 25, preset medium, no audio and +faststart. Convocation uses original dimensions/frame rate, libx264 CRF 25, preset medium, AAC 128k and +faststart. Poster is the first tech-stack frame at 960px width.
