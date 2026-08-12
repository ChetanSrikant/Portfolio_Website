# Gundam Portfolio — Home Page

React + React Three Fiber build of the home page: Hero → Gundam entrance →
philosophy quote → Gundam Playground → CTA dock → Footer, all scroll-driven
around a single pinned Three.js canvas.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
```

```bash
npm run build      # production build to dist/
npm run preview    # serve that build locally
```

Requires Node 18+.

## How it's structured

- `src/components/GundamModel.jsx` — loads the rig, drives all 7 baked
  clips (idle loop + one-shot crossfades for saber/shield/rifle/boomerang/
  lifter/static), handles click (saber) and double-click (shield), and
  smoothly damps toward whatever rotation/position/scale the scroll stage
  asks for.
- `src/components/GundamStage.jsx` — the scrollytelling orchestrator. A
  single `position: sticky` canvas stays pinned in the viewport while
  scroll progress (0→1) drives the model's entrance, left-turn, and the
  crossfade between four overlay panels (Intro / Philosophy / Playground /
  CTA). Narrative timing lives in the `RANGES` constant and
  `computeGundamTransform()` — nudge the numbers there to retime beats.
- `src/components/Playground.jsx` — buttons for every clip, plus real
  shake detection (`devicemotion` on phones that support it, rapid mouse
  velocity as the desktop stand-in).
- `src/hooks/useScrollProgress.js` — the one scroll listener the whole
  stage runs off of.
- `src/index.css` — the design tokens (colors, type, spacing). The accent
  gold/bronze is a single CSS variable (`--accent` and friends) — swap it
  and the whole site re-tints.

## Known placeholders — worth a look before this goes live

- **Hero copy & role** (`Hero.jsx`): "Chetan — Software Engineer" and the
  headline are first drafts; I didn't have your exact title/tagline on
  hand.
- **Contact links** (`CTADock.jsx`, `Footer.jsx`): `hello@chetan.dev`,
  GitHub/LinkedIn URLs are placeholders.
- **Résumé**: "View résumé" links to `/resume.pdf`, which doesn't exist
  yet — drop a PDF at `public/resume.pdf` and it'll work.
- **"Chat with the Gundam"**: intentionally disabled/greyed out — this is
  where the docked chatbot persona plugs in later.
- **Accent color**: `#c9a24b` in `src/index.css` is a placeholder
  gold/bronze, per your earlier note that the exact hex wasn't finalized.
- **Model recolor**: the Gundam is still in its native pink/purple
  colorway — recoloring toward black/gold is still an open decision from
  planning, not done here.
- **Rig quirk worth knowing**: the glb's bind pose is "exploded" (shield/
  rifle/sabers/backpack all rest detached from the body rather than
  mounted). That's harmless for the baked animations but means any
  future auto-fit/bounding-box logic needs the
  `BIND_POSE_INFLATION` correction in `GundamModel.jsx` — see the
  comment there if you touch it.

## Not in this pass

Just the home page, per the brief — About / Projects / Experience /
Beyond / Education / Contact pages, and the chatbot backend, are next.
