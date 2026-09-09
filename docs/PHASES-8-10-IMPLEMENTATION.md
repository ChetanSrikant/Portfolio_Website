# Phases 8–10 — implementation and validation

Phase 7 domain configuration remains on hold at the owner's request. No recording or recorded RAG demonstration will be added, also at the owner's request.

## Phase 8: visual consistency

- Work's existing particle veil now protects the left reading area more strongly. About's existing backdrop wrapper has a graduated mask and lower mobile opacity. The constellation implementation was not edited.
- Beyond retains its zoom sequence as the dominant scroll effect. Its archive uses native horizontal scrolling instead of consuming a vertical scroll runway; all seven photographs remain. The five Right now statements are compact editorial rows instead of sticky stacking panels. Desktop zoom height changed from 260vh/minimum 1800px to 220dvh/minimum 1400px; existing mobile/reduced-motion static galleries remain.
- Beyond's ambient field is quieter. At the measured 1440 × 900 desktop viewport the page was 9,801px tall, versus the earlier roadmap's approximate 12,000–13,000px. This is an approximate comparison, not a controlled before/after benchmark.
- Bronze-gold tokens remain the accent. No mint palette, new font family, replacement photographs, or broad style rewrite was added.
- The Gundam initialization labels now report GLB loaded and renderer ready rather than fictional armor/optics telemetry. No clip, camera, transform path, or damping parameter was edited in this pass.
- The existing RAG walkthrough is explicitly labeled illustrative, not a live run. Automatic cycling was removed; its stage tabs support arrow keys, Home, End, roving focus, and a labeled panel.

## Phase 9: selected technical detail

- Added a native, keyboard-operable implementation disclosure after the home stage. It explains the actual authored clips, scroll targets, delta-time damping, reduced-motion handling, and rendering/device behavior. Placing it after the stage avoids changing the stage's internal spacing.
- Added one restrained focus-within evidence highlight to the RAG walkthrough, without cursor tracking or an animation loop.
- Did not add the optional magnetic resume effect: the navigation retains a fixed, predictable interaction while the page's existing motion remains dominant.
- Recorded RAG demonstration intentionally omitted, not awaiting assets.

## Phase 10: completed checks

The first implementation build passed with existing large-chunk warnings. Tests ran against that production build on local Chrome, not the deployed site.

| Check | Result and limits |
| --- | --- |
| Seven routes at 320, 375, 768, 1024, 1440, 2560px | No document-level horizontal overflow in 42 measurements. Routes: Home, About, Work, Projects, Beyond, Credentials, missing page. This does not certify every deep section's visual layout. |
| Short mobile viewport | No document-level overflow at 320 × 568 on each route. |
| Internal links and anchors | All collected internal destinations returned HTTP 200 locally, and all collected fragment targets existed. Resume returned successfully. Local SPA HTTP 200 alone does not prove production routing. |
| External links and email | Seven external/email destinations collected, not requested or activated; no mail or external interaction sent. |
| RAG stage tabs | End key selected the last tab; selection did not auto-advance. |
| Work lightbox | Six alternating Tab/Shift+Tab checks stayed inside; Escape closed it. |
| Engineering disclosure | Verified with browser keyboard input: Enter closes and reopens the focused summary. The first CDP probe returned false; its input helper was corrected and the direct browser check passed. |
| Reduced motion | Beyond used the static photo gallery and non-scroll-linked archive. This is not an all-components motion audit. |
| Failed home GLB | Blocked request triggered the new failure message; navigation and selected-work content remained available. |
| Failed hero image | Heading, navigation, and descriptive image alt remained present. |
| Console | No uncaught Runtime exceptions captured by the first regression script; not a guarantee of zero warnings. |
| Visual inspection | Reviewed screenshots of About's reading mask, Beyond Right now, and the RAG walkthrough. |
| Zoom | Checked 720 × 450 CSS viewport as a 200%-equivalent layout approximation; actual browser zoom remains untested. |
| Static source validation | Changed JSX parsed successfully with Babel; QA script syntax and git whitespace checks passed. |

## Lighthouse: three-run medians

Local production Home page, Lighthouse 12.8.2, three mobile and three desktop runs. These precede the final Work-only polish, lightbox focus fix, and missing-page failure boundary.

| Metric | Mobile median | Desktop median |
| --- | --- | --- |
| Performance | 64 | 97 |
| Automated accessibility | 100 | 100 |
| LCP | 3.98s | 0.84s |
| CLS | 0 | 0 |
| Total blocking time | 902ms | 112.5ms |

Mobile remains a performance concern. The representative run reported 5.4s main-thread work, 1.6s JavaScript execution, roughly 300ms estimated render-blocking savings, and about 118–119KiB potential image-sizing savings. Automated accessibility 100 is not a screen-reader or WCAG conformance certification. No claim of a three-run improvement over the older single-run audit is made.

## Final changes requiring rebuild/retest

After the tested build, additional source fixes were made:

- Work walkthrough labels increased to 11px, with wrapping and clearer muted text.
- MediaLightbox now keeps the original opener reference while moving between artifacts; its focus trap also recaptures focus if it lands outside the dialog.
- Missing-page model errors now have a boundary that preserves the route copy and return-home link instead of crashing the page.
- Added the restrained evidence focus highlight.

The final rebuild was rejected by the approval service because the workspace was out of credits. It was not bypassed. These final changes passed static syntax checks but have not passed a production rebuild or the prepared follow-up browser checks. The current preview can therefore lag behind these source changes.

Once approval capacity is restored, run:

```powershell
npm run build
$env:QA_DETAIL = '1'
node scripts/qa-portfolio.mjs
Remove-Item Env:QA_DETAIL
node scripts/qa-portfolio.mjs
```

The detailed pass covers the engineering disclosure, lightbox opener restoration after changing artifact, Projects keyboard dialog, Paper at Real world, Gundam action buttons, and a failed missing-page GLB. It is prepared but not yet executed.

## Remaining manual gates

- Firefox, Safari, and a physical Android device (not available in this environment).
- Actual 200% browser zoom and real screen-reader output.
- Full keyboard navigation through every interactive surface, including the About gallery.
- Visual confirmation of the complete Gundam choreography and 3D Paper. Their runtime sources were preserved, but the initial About-at-top probe did not initialize Paper and is not proof it rendered correctly.
- Repeated controlled 3D mount/unmount memory and WebGL context-retention profiling.
- Verify external repository/social destinations and deployed HTTP statuses when deployment is in scope.

Phase 10 is partial, not signed off for deployment.

## Files and retained scope

Main changes: `src/pages/BeyondPage.jsx`, `BeyondPage.module.css`, `AboutPage.module.css`, `InternalPages.module.css`, `WorkPage.jsx`, `HomePage.jsx`, `NotFoundPage.jsx`; `src/components/GundamEngineeringNote.jsx` and its CSS Module; `MediaLightbox.jsx`, `GundamStage.jsx` (labels only), and `ui/HorizontalScrollCarousel.jsx`, `ui/ZoomParallax.module.css`.

Reusable local QA: `scripts/qa-portfolio.mjs`, `scripts/qa-lighthouse.mjs`. Reports and screenshots are under ignored `tmp/phase-8-10-qa/`. No previous audit artifacts, CV generation scripts, credentials, resume, or personal media were deleted. `src/shaders/3d-paper/` and `CursorReactiveConstellationField.jsx` remain untouched.

The redesign skill guided scoped changes to the existing system rather than a new visual design.
