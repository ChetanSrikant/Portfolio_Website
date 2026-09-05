# Portfolio audit — 5 September 2026

## 1. Executive summary

The portfolio has a distinctive editorial identity, genuine personal imagery, and more substantive project context than a typical effects-led portfolio. Its biggest weakness is that recruiters pay a substantial loading and scrolling cost before reaching the strongest evidence: Home scored **31 mobile / 41 desktop** in local Lighthouse performance tests. Functional problems also exist in the contact CTA, mobile dock placement, and modal keyboard navigation. The single highest-leverage change is to **make the first screen and direct proof links independent of the 3D experience**, keeping the Gundam as an optional, progressively loaded enhancement rather than an early rendering dependency.

### Scope, method, and limits

- Audited the freshly built current source at `http://127.0.0.1:4173`, not a deployed public URL. The preview was initially unavailable; connection-error-page results were discarded, the build was regenerated, and all route tests were rerun.
- Used Chrome 152 headless with the Chrome DevTools Protocol: actual navigation, viewport resizing, DOM measurements, screenshots, network/console capture, keyboard events, hit testing, reduced-motion emulation, and CPU/network throttling. This uses DevTools instrumentation, not merely source inference.
- Loaded Home, About, Work, Projects, Beyond, Credentials, and an unknown route. Tested widths **320, 375, 768, 1024, 1440, 2560px**, with a 900px viewport height. Screenshot inspection concentrated on 375px and 1440px; the other widths received geometry checks, not exhaustive visual inspection of every scroll position.
- Ran Lighthouse 12.8.2 on Home with its mobile and desktop presets, sequentially. Scores are **single-run local lab results**, not PageSpeed Insights field data, a site-wide score, or physical-phone performance.
- An additional cold-cache Home test used 375 × 812, 150ms latency, 200,000 bytes/s download and 4× CPU slowdown. No application source was changed.
- Source review used the **redesign-existing-projects** skill as an audit checklist, prioritizing existing design consistency rather than its generic replacement prescriptions.
- Safari/iOS, Firefox, physical device-motion gestures, screen-reader speech output, and a sustained GPU-memory soak test were **not tested**. No Firefox installation was found at its standard local path. No cross-browser or leak-free guarantee is implied.
- External inspiration was researched through published pages and component descriptions; those sites were not interactively profiled. Godly's gallery could not be retrieved reliably, so no recommendation is falsely attributed to a specific Godly interaction.

Evidence: [route/network/viewport results](<C:/Users/Lenovo/OneDrive - BML MUNJAL UNIVERSITY/Desktop/Portfolio Website/gundam-portfolio/tmp/audit/results.json>), [interaction results](<C:/Users/Lenovo/OneDrive - BML MUNJAL UNIVERSITY/Desktop/Portfolio Website/gundam-portfolio/tmp/audit/interactions.json>), [CTA and project-modal checks](<C:/Users/Lenovo/OneDrive - BML MUNJAL UNIVERSITY/Desktop/Portfolio Website/gundam-portfolio/tmp/audit/extra.json>), [throttled run](<C:/Users/Lenovo/OneDrive - BML MUNJAL UNIVERSITY/Desktop/Portfolio Website/gundam-portfolio/tmp/audit/throttled.json>).

## 2. Critical bugs

| Issue | Location | Impact | Fix |
| --- | --- | --- | --- |
| **Confirmed: floating dock blocks the primary CTA on mobile.** At 375 × 900, the button spans y=839–885px; its center hit-tests to the dock, not the button. | Home; [Hero](<C:/Users/Lenovo/OneDrive - BML MUNJAL UNIVERSITY/Desktop/Portfolio Website/gundam-portfolio/src/components/Hero.jsx>) and [FloatingDock](<C:/Users/Lenovo/OneDrive - BML MUNJAL UNIVERSITY/Desktop/Portfolio Website/gundam-portfolio/src/components/FloatingDock.jsx>). [Screenshot](<C:/Users/Lenovo/OneDrive - BML MUNJAL UNIVERSITY/Desktop/Portfolio Website/gundam-portfolio/tmp/audit/home-375.png>) | The visible “Explore my work” action is obscured and its central click area intercepted at this position. Scrolling can uncover it, but the initial interaction looks broken. | Reduce the mobile hero's pre-CTA height; reserve a dock-safe viewport region and ensure focused elements scroll clear of fixed UI. Consider suppressing the dock while hero CTAs occupy that region. Bottom page padding alone will not prevent all intermediate overlaps. |
| **Confirmed: “Start a conversation” lands at Current direction, not contact.** | Home; [Hero](<C:/Users/Lenovo/OneDrive - BML MUNJAL UNIVERSITY/Desktop/Portfolio Website/gundam-portfolio/src/components/Hero.jsx>) calls the fractional contact target in [home.js](<C:/Users/Lenovo/OneDrive - BML MUNJAL UNIVERSITY/Desktop/Portfolio Website/gundam-portfolio/src/config/home.js>). | Click ended around scrollY=9,627 with “What I'm focused on now” content, not a contact action. This wastes the highest-intent click. | Use a real contact anchor or the existing mailto link. Decouple content navigation from choreography fractions; do not alter Gundam keyframes to repair navigation. |
| **Confirmed: Projects modal traps Tab on Close.** Four consecutive Tabs remained on Close although a GitHub link exists. | [ProjectsPage modal effect](<C:/Users/Lenovo/OneDrive - BML MUNJAL UNIVERSITY/Desktop/Portfolio Website/gundam-portfolio/src/pages/ProjectsPage.jsx>) | Keyboard users cannot reach the public repository—the strongest verification path. | Cycle through all enabled focusable descendants with Tab/Shift+Tab; only wrap at the boundaries. Keep Escape and return-focus behavior. |
| **Confirmed: Work media viewer allows focus behind the open dialog.** | [MediaLightbox](<C:/Users/Lenovo/OneDrive - BML MUNJAL UNIVERSITY/Desktop/Portfolio Website/gundam-portfolio/src/components/MediaLightbox.jsx>) | After traversing viewer controls, Tab reached “Explore all projects” and footer links while the modal remained open. | Contain focus in the dialog, make background content inert, and restore focus to the opener on close. Escape already closes correctly. |

**Other technical findings:** `/robots.txt` returns the SPA HTML with HTTP 200; Lighthouse reports 22 syntax errors. Serve a real robots file, and check deployed missing-path handling separately: the local unknown-route page also uses the SPA's 200 response, not an HTTP 404. These are crawl/deployment issues, not evidence that the visible 404 design is broken.

**Verified positives:** all seven sampled routes rendered main content; the route pass recorded no console exceptions/log entries, failed network requests, or completed-but-broken images. Résumé returned **200, application/pdf, 698,990 bytes**. The “Explore my work” CTA reached the featured-work heading in the interaction test. No page-level horizontal overflow was measured at any requested width. Overflowing decorative drift tiles, horizontally scrollable diagrams/filters, and the archive track are not automatically layout bugs.

**Coverage caveat:** this is not an exhaustive link certification. Sampled internal routes work; external GitHub/LinkedIn destinations and every nested hash/modal state were not individually opened. Some lazy media midway through long pages may not load during top/bottom sampling.

## 3. Performance issues

### Measured Home results

| Metric | Mobile | Desktop |
| --- | ---: | ---: |
| Lighthouse performance | **31/100** | **41/100** |
| Accessibility / Best practices / SEO | 96 / 96 / 92 | 100 / 100 / 92 |
| First Contentful Paint | 3.8s | 0.9s |
| Largest Contentful Paint | **32.9s** | **5.4s** |
| Total Blocking Time | **4,610ms** | **1,720ms** |
| Time to Interactive, legacy diagnostic | 33.4s | 5.4s |
| Speed Index | 7.2s | 1.6s |
| Cumulative Layout Shift | 0 | 0.095 |
| Observed Lighthouse page transfer | 6,783KiB | 6,783KiB |

Raw reports: [mobile](<C:/Users/Lenovo/OneDrive - BML MUNJAL UNIVERSITY/Desktop/Portfolio Website/gundam-portfolio/tmp/audit/lighthouse-mobile.json>), [desktop](<C:/Users/Lenovo/OneDrive - BML MUNJAL UNIVERSITY/Desktop/Portfolio Website/gundam-portfolio/tmp/audit/lighthouse-desktop.json>). Mobile used Lighthouse's simulated 4× CPU / 150ms RTT preset, 412 × 823 CSS pixels. TTI remains in this report's diagnostic output but is not a current Core Web Vital or performance-score component; do not substitute it for field INP. [Chrome's TTI documentation](https://developer.chrome.com/docs/lighthouse/performance/interactive)

The separate applied-throttling run recorded LCP **8.1s** and cumulative observed layout shifts **0.018** within its 20-second window, with the model still initializing. Its settings and measurement window differ from Lighthouse's simulation: the two numbers are not interchangeable. The unthrottled route probe recorded Home shifts around 0.104; its simple accumulated shift observer is not the official CLS session-window algorithm. Lighthouse's 0.095 desktop result is close enough to the good threshold that font/reveal timing deserves investigation rather than declaring layout stability solved.

| Issue | Metric affected | Suggested fix |
| --- | --- | --- |
| Early 3D execution competes with the first screen. Home statically imports GundamStage, whose model preloads on module evaluation. | Mobile main-thread work 11.7s; script evaluation 8.3s; 3D shared chunk attributed about 5.16s scripting. LCP/TBT/TTI. | Load the editorial shell independently, then import the 3D stage near viewport entry or after deliberate interaction. Preserve its wrapper dimensions and choreography contract. Add a static poster/low-power option. |
| Hero portrait is discovered late and rendered much later. It is already eager and fetchpriority=high. | Mobile LCP breakdown: ~8.8s load delay, ~0.12s load time, ~23.5s render delay. | Preload the correct responsive hero source in initial HTML or prerender the hero. First remove JS/render competition; simply compressing this ~147KB JPEG will not address the dominant delay. |
| Twelve drift-wall source images download before a visitor reaches the stage, despite lazy attributes. | Payload/bandwidth contention. Lighthouse estimates 1,859KiB responsive-image savings, concentrated in these tiles. | Supply appropriately sized thumbnails and srcset; postpone mounting decorative walls until near view. Example: drift-03 is 1086 × 1184 but displayed around 120 × 159 in the audit. |
| Gundam model is 4,409,192 bytes. | Transfer time and decoding/GPU initialization. | Defer first, then evaluate a separately generated optimized derivative with animation/material regression tests. Do not blindly replace the authored GLB or remove its clips. |
| Large shared and About chunks. | Build: 3D shared JS ~807.81KB raw / 217.76KB gzip; About ~819.76KB / 202.76KB; entry ~278.77KB / 91.27KB. | Routes are already lazy; split *within* heavy routes. About embeds the self-contained Paper document as a raw import. Lazy-load its wrapper near visibility while leaving the Paper implementation intact. Chunk names do not prove all bytes belong to one dependency. |
| Entire threeui stylesheet imported by GundamStage. | ~73.99KB raw / 26.46KB gzip; Lighthouse marks ~26KiB unused during this load. | Audit Home's actual selector requirements and isolate the stylesheet to consumers that need it. Coverage at startup is not proof the package or stylesheet is dead across the site. |
| Large active secondary-page assets. | About campus PNG 2.36MB; convocation PNG 1.58MB; tech-stack video 16.04MB; Work RAG image 0.84MB; Beyond bridge PNG 1.22MB. | Generate responsive image derivatives and poster/video variants. The large files are inventory sizes, not a claim they all transfer on Home. Keep original personal photos and the existing 3D Paper assets untouched. |
| Render-blocking external font CSS. | Lighthouse estimates ~1.42s combined render-blocking savings; Google font CSS contributes ~857ms. | Keep display=swap and preconnect (already present); consider self-hosted Latin WOFF2 subsets and only necessary weights. Tune fallback metrics to reduce FOUT shifts. Do not add more type families. |
| Continuous 3D rendering and contact shadows. | GPU/battery use, especially below the first viewport. | Add measured visibility/idle policies, avoid recomputing shadows when unchanged, retain animation-driven invalidation while moving. Merely setting demand rendering would freeze animation unless invalidation is implemented correctly. |

Do **not** add the image-format and resizing savings together: they overlap. Lighthouse estimated 669KiB from modern formats separately, not an additional guaranteed saving.

**Motion and memory:** a three-second unthrottled idle-stage sample produced 180 callbacks, mean interval 16.72ms, one interval over 33.4ms, maximum 33.5ms. This does not establish GPU frame delivery or mobile scroll smoothness; it does suggest no persistent idle main-thread stall in that short desktop sample. Source shows delta-based damping and precompilation already, so replacing easing blindly is unjustified. Gundam clears click timers/listeners and stops actions on teardown; Paper removes its iframe when offscreen; several canvas components clean observers and animation frames. No memory leak was established. Validate renderer memory/context counts over repeated mount/unmount cycles before claiming one, distinguishing shared GLTF cache retention from leaking allocations. This is a client-rendered createRoot app, not a hydration path; no hydration mismatch was observed or expected in the current architecture.

## 4. UX issues

| Issue | Why it matters | Suggested fix |
| --- | --- | --- |
| AI-builder positioning is clear; DS/SDE hiring fit and proof are not explicit within five seconds. | The headline communicates direction but the supporting sentence is broad. A recruiter still needs role fit, contribution, and evidence. | Add one short factual role-oriented line and a compact proof strip: featured system, personal contribution, repository/case-study link. Use real results only; do not invent metrics. |
| Skills start around 3,150px and featured systems around 5,379px on desktop Home. | Roughly 3.5 and 6 viewport heights at 900px tall before these headings; the Gundam introduction comes first. | Put one proof preview immediately after the hero and retain direct links to Work/Projects. Keep the longer cinematic journey optional. |
| Mobile portrait precedes all positioning text. | At 375 × 900 the portrait occupies roughly y=68–458, pushing CTA to the dock region. Smaller-height phones require more scrolling. | Bring the headline/role line earlier or shorten the portrait treatment; preserve the photo's personal quality. |
| Home's labeled navbar disappears after leaving the hero. | Confirmed aria-hidden=true after the work CTA. The dock remains, but icon-only navigation is slower for unfamiliar visitors. | Keep labeled navigation accessible or offer compact labels; explicitly decide whether condensing still matches the desired navigation policy. |
| Work and Projects are differentiated only after reading their intros. | Users must infer “flagship case studies” versus “broader experiments.” | Use those labels in navigation descriptions or page entry links. Preserve the existing distinction in content. |
| Beyond stacks zoom, horizontal archive, stacked text, and page-turn gestures in one long middle. | At 1440px its document is ~13,323px tall, comparable to Home's ~12,644px. Personal context risks becoming an endurance test. | Keep one dominant interaction, shorten lower-priority transitions, retain direct chapter links and the already-static mobile/reduced-motion archive. This is a recommendation, not a request to remove personal content. |
| Small-screen diagrams and filters require horizontal exploration. | Their overflow is intentional, but hidden continuation may be missed. | Add a visible continuation cue and keyboard focusability for scrollers, or use vertical process diagrams at narrow widths. |
| Credentials is an explicit “being assembled” page. | Not a broken route, but not hiring evidence yet. | Keep résumé and Work as the primary proof destinations until the credential material is verified; don't promote the placeholder. |
| No direct hero GitHub link; résumé lives in navbar/dock. | Source verification requires more exploration. | Add a simple GitHub text link beside the proof summary, not another large animated CTA. |

## 5. Visual polish suggestions

| Issue | Current state | Suggested change |
| --- | --- | --- |
| Navigation/meta text loses hierarchy by becoming too faint and small. | “Menu” is 9px; eyebrow and metadata styles commonly use 8–10px monospace. | Use 11–12px for meaningful labels and improve contrast. Keep miniature type only for decorative markings. |
| Particle lines cross reading areas. | Work's gold network visibly passes through the headline and paragraph; About's constellation sits behind mobile text. | Mask/dim the field behind text columns while keeping stronger connections in negative space. Reuse the same visual system rather than adding another effect. |
| Effects are individually polished but collectively heterogeneous. | Grain/glyphs, particle networks, shader grids, 3D models, image zoom, card stacks, and text turns coexist. | Establish a motion hierarchy: one major moment per page; typography and proof remain quiet. Specify shared durations, easing, and surface values. |
| Palette brief and current implementation differ. | The active global system is black/off-white and bronze-gold (#c9a24b), not an evenly amber/mint palette. | Keep bronze as the signature; reserve any mint for a clearly defined semantic status, not a competing decorative accent. |
| Terminal motif sometimes labels atmosphere more than useful state. | Stage headings/readouts and philosophy filenames provide personality; architecture content provides actual meaning. | Use terminal metadata to expose stack, artifact type, contribution, or source status. Avoid fake telemetry and invented performance counters. |
| Large text panels can feel like a component demo. | Beyond's five “Right now” cards share an oversized surface treatment for short statements. | Reduce their visual weight or stack only the most meaningful items. Keep the archival photos—not repeated component behavior—as the personal signature. |
| Strong existing type system risks unnecessary replacement. | Space Grotesk + Manrope + JetBrains Mono already produces a coherent display/body/metadata hierarchy. | Tune line length and weight instead of a font swap. Keep prose near 55–70 characters and avoid expanding reading columns on ultrawide screens. |
| Gundam presentation has a strong silhouette but considerable empty space. | The tested stage shows a large left-positioned model against a quiet right side. | Add a small factual implementation caption in the open area. For model polish, test a modest rim-light adjustment before bloom/postprocessing or a camera rebuild. |

Visual references reviewed include [desktop Home](<C:/Users/Lenovo/OneDrive - BML MUNJAL UNIVERSITY/Desktop/Portfolio Website/gundam-portfolio/tmp/audit/home-1440.png>), [mobile About](<C:/Users/Lenovo/OneDrive - BML MUNJAL UNIVERSITY/Desktop/Portfolio Website/gundam-portfolio/tmp/audit/about-375.png>), [desktop Work](<C:/Users/Lenovo/OneDrive - BML MUNJAL UNIVERSITY/Desktop/Portfolio Website/gundam-portfolio/tmp/audit/work-1440.png>), [mobile Beyond](<C:/Users/Lenovo/OneDrive - BML MUNJAL UNIVERSITY/Desktop/Portfolio Website/gundam-portfolio/tmp/audit/beyond-375.png>), and [Gundam stage](<C:/Users/Lenovo/OneDrive - BML MUNJAL UNIVERSITY/Desktop/Portfolio Website/gundam-portfolio/tmp/audit/gundam-stage.png>).

## 6. Accessibility issues

| Issue | WCAG concern | Fix |
| --- | --- | --- |
| **Measured Menu contrast: 3.65:1**, #666663 on black, 9px regular. The same token on #0d0d0d is ~3.37:1. | 1.4.3 Contrast (Minimum): normal text requires 4.5:1. | Raise meaningful muted text to an AA-tested value. The secondary #a0a09b on black is ~8.00:1; gold #c9a24b is ~8.75:1. Audit actual image-backed combinations separately. |
| Projects dialog blocks access to its GitHub link. | 2.1.1 Keyboard, 2.4.3 Focus Order. | Replace the Close-only Tab handler with a complete focus loop. Confirm reverse Tab and Escape. |
| Work dialog does not contain focus. | 2.4.3 Focus Order; modal semantics do not match behavior. | Trap focus and make the background inert. Preserve the existing accessible title and labeled controls. |
| Reduced-motion navigation still smoothly traverses several screens. | Motion accommodation; relevant to 2.3.3 Animation from Interactions (AAA), not automatically an AA failure. | The emulated reduced-motion click moved from y=0 to 141 at 150ms and ~5,282 after settling. Branch explicit JS scrolling to instant/auto; CSS reduced-motion overrides cannot cancel an explicit smooth option. |
| Gundam idle action still starts on mount irrespective of reducedMotion; Paper still has pointer/intro movement. | Possible 2.2.2 Pause, Stop, Hide concern for sustained automatic motion; reduced motion is only partially implemented. | Provide an explicit static/pause mode for the Gundam; distinguish requested action playback from automatic idle. Paper already disables time-based idle through REDUCED, but reads preference at startup and retains some interaction motion. Treat further Paper changes as a separately approved task. |
| RAG process controls declare tablist/tab but have no matching tabpanel/roving-keyboard wiring in source. | 1.3.1 structure and 4.1.2 role/state coherence; tab interaction expectations. | Either implement a complete tab pattern, including arrow navigation and panel relationships, or use ordinary buttons with an appropriate selected/pressed state. |
| 3D drag inspection has no equivalent rotation control in the inspected Playground DOM. | 2.1.1 Keyboard if inspect/rotate is meaningful functionality. | Add rotate-left/right or keyboard camera controls. Existing Saber/Shield/Rifle/Boomerang/Lifter/Hold Pose/Reset controls are native buttons and accepted keyboard Enter without errors in the sampled 404 playground. |
| Light-theme muted token is borderline insufficient. | Token calculation: #777773 on #f4f4f0 is ~4.08:1, below normal-text AA. Actual light-theme screens were not audited. | Verify the light theme if it is exposed; adjust its text tokens independently rather than assuming dark-theme fixes suffice. |
| Some focus treatments are subtle rather than absent. | 2.4.7 Focus Visible; fixed dock can also obscure focus. | Preserve the existing gold button outlines and footer underline/arrow focus treatment. Increase clarity where needed; don't label outline:none alone as a failure when an alternative exists. |

Contrast thresholds follow [W3C's contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Ratios above are calculated solid-color pairs, not a blanket certification of text over imagery.

**What already works:** skip links exist; nav has an accessible name and current-page state; the mobile toggle has expanded/controls attributes; dock icons have labels; image alt attributes were present in sampled DOM; modal Escape works; Beyond's stacking and carousel both reported disabled under emulated reduced motion. GridBloom's source switches to demand rendering when reduced/offscreen, and About's tech-stack video disables autoplay and exposes controls under reduced motion. Automated Home accessibility scores do not cover modal behavior or all routes.

## 7. Wow-moment recommendations

These are adaptations to the existing React, CSS Modules, Framer Motion, GSAP, and react-three-fiber stack—not requests for Tailwind, a framework migration, or more animation packages. Implement only after the critical interactions and loading path are fixed.

| Name | Where | How to implement | Effort | Why it fits |
| --- | --- | --- | --- | --- |
| **Evidence-first interactive system slice** | Featured RAG case study | Extend the existing process state control: choose a real sample query, reveal retrieved passages, then grounded output and a failure case. Use local recorded data and Framer Motion opacity/layout transitions; label it “recorded example,” not live inference. | M | Demonstrates retrieval judgment, grounding, and failure handling. Inspired by the product-in-context UI on [Linear](https://linear.app/) and its [Lapa Ninja reference](https://www.lapa.ninja/post/linear/), not by copying its branding. |
| **One restrained spotlight evidence panel** | Featured Work artifact, not every card | CSS variables for pointer coordinates and a single low-opacity pseudo-element glow; no React state per pointer frame. Show the same border on focus; no tracking on touch/reduced motion. | S | Directs attention to inspectable evidence. Specific reference: Hossain Jahed's Spotlight Card, discussed in [21st's spotlight guide](https://21st.dev/blog/react-spotlight-effect-components). |
| **Magnetic résumé micro-interaction** | Desktop résumé CTA only | Keep the anchor's hitbox fixed and spring just the inner label/icon by at most a few pixels using existing Framer Motion. Disable on coarse pointers and reduced motion. | S | Adds care to a hiring action without hiding its purpose. Reference: bundui's Magnetic Button and ibelick's wrapper in [21st's magnetic-effects guide](https://21st.dev/blog/react-magnetic-cursor-effects). |
| **Decision-to-evidence text reveal** | One short case-study conclusion | Reuse the existing SplitReveal concept for a fast word-level opacity reveal, followed by a permanently visible evidence link. Accessible text remains intact; no pinned scrolling and no initial blank paragraph in reduced motion. | S | Highlights a concrete engineering decision rather than animating decorative slogans. Reference: Dillion Verma's Text Reveal in [21st's text catalogue](https://21st.dev/community/components/s/text). |
| **Technical capability → artifact handoff** | Home immediately below the first screen | A compact static list—forecasting, retrieval, software systems—switches the adjacent real artifact preview on click/focus, with a short crossfade. Always expose the destination link. | M | Converts abstract skills into proof. ChainGPT explicitly associates capabilities with individual tool surfaces; borrow that association, not its marketing density. [ChainGPT](https://www.chaingpt.org/) |
| **Inspectable Gundam engineering note** | Existing stage's negative space | A small DOM disclosure explains the actual GLB clips, delta-time damping, scroll-state mapping, and fallbacks. Add a static mode. Separately A/B-test a slightly clearer rim light and gentler idle; preserve authored paths and clips. No extra postprocessing. | S–M | Turns spectacle into evidence of implementation skill. Awwwards highlights Bruno Simon's **3D game project navigation**; the transferable idea is tying 3D to useful portfolio information, not building a game. [Awwwards reference](https://www.awwwards.com/sites/bruno-simon-portfolio) |

Godly was requested and investigated, but its gallery fetch failed; its [curation overview](https://godly.website/info) does not establish a specific interaction to copy. The recommendations above use sources that could be inspected. Avoid additional full-page cursor effects, another horizontal skills section, or animated benchmark counters without real measurements—the site already has enough spectacle.

## 8. Prioritized action plan

Ranked qualitatively by recruiter impact × implementation ease; effort assumes focused changes and regression testing.

1. **Fix the contact CTA destination.** S; direct contact anchor/mailto. Acceptance: the first click exposes or opens the contact action at every breakpoint.
2. **Unblock the mobile hero CTA.** S–M; correct dock collision and first-screen composition. Acceptance: center and edge hit tests reach the intended CTA at 320/375px and short viewport heights.
3. **Fix both modal keyboard models.** S–M; reachable GitHub links, contained focus, Shift+Tab, Escape, focus restoration.
4. **Decouple the initial hero from the 3D loading path.** M; biggest performance leverage. Keep reserved geometry and authored choreography intact; compare repeated cold Lighthouse runs.
5. **Create small drift-wall image derivatives and defer decorative loading.** S–M; target the measured ~1.8MiB responsive-image opportunity without removing personal source images.
6. **Put one credible project proof and GitHub link near the hero.** S–M; recruiters should reach evidence without entering the long stage narrative.
7. **Raise functional muted-text contrast and improve labels.** S; fix Menu first, then audit small metadata and image-backed navigation states.
8. **Honor reduced motion in JS navigation and offer a static 3D mode.** S–M; do not conflate reduced movement with disabled user-requested actions.
9. **Complete basic crawl/share delivery.** S; real robots.txt, route-appropriate descriptions/social metadata, and verify production unknown-route status. Local SEO score is 92.
10. **Ship one evidence-led wow moment, then simplify competing motion.** M; prioritize the recorded RAG system slice over another decorative effect. Measure performance again before adding anything else.

Before sign-off, test actual iOS Safari and Firefox, a physical low-end Android, 200% zoom, screen-reader traversal, every public repository link, deep links after cold loads, model-load failure, and a repeated 3D mount/unmount memory profile. These remain explicit validation tasks—not assumed failures.

**Build result:** npm run build passed. Vite reports existing >500KB chunk warnings. No site fixes or redesign were implemented during this audit; only the report and diagnostic evidence were added.

