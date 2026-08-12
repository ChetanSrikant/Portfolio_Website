# Gundam Model and Movement System

This document covers only the 3D Gundam experience: the GLB asset, rig animations, scroll-linked movement, direct model interaction, Playground controls, rendering, accessibility, performance, and verification.

## Experience contract

The Gundam must follow these rules throughout the Home page:

1. The Hero does not contain the Gundam.
2. The Gundam first appears in the Intro stage after the Hero.
3. The Intro orientation starts at an 11-degree heading.
4. One persistent model continues through the full scroll journey. It is not replaced by a second model between sections.
5. Intro to Philosophy is the only automatic flight that uses `Lifter`. Every later transition remains in Idle while following its damped transforms.
6. Intro opens once with `Beam Saber → Rifle → Idle`. Outside that opening sequence, combat clips are manual Playground actions and are never triggered by scrolling.
7. The Playground is the model's final destination. It sits immediately above the footer.
8. The Gundam lands on the right half of the Playground while the controls occupy the left half.
9. The model does not continue below the Playground or enter the footer.
10. The website directs the model before Playground. Drag, click, double-click, gestures, and manual controls become available only after landing.

## Relevant files

| File | Responsibility |
| --- | --- |
| `public/models/justice-gundam.glb` | Gundam mesh, skeleton, materials, and baked animation clips |
| `src/components/GundamModel.jsx` | GLB loading, normalization, animation mixer, pointer interaction, smooth transforms, and imperative API |
| `src/components/GundamStage.jsx` | Persistent WebGL canvas, camera, lighting, scroll choreography, HUD, and final landing |
| `src/components/Playground.jsx` | Manual animation controls, shake gesture, pointer-velocity gesture, idle reset, and view reset |
| `src/config/home.js` | Scroll ranges, section targets, horizontal path, scale, rotation, and stage labels |
| `src/hooks/useScrollProgress.js` | Converts the sticky stage's scroll distance into normalized progress from `0` to `1` |
| `src/components/GundamStage.module.css` | Sticky canvas, two-column staging, overlays, HUD, mobile layout, and landing space |
| `src/components/Playground.module.css` | Control-surface layout and responsive button behavior |

## Runtime stack

The model system uses:

- React 18
- Three.js `0.165`
- React Three Fiber `8.17`
- Drei `9.114`
- Vite 5

The main Three.js helpers are:

- `useGLTF()` to load the GLB
- `useAnimations()` to bind baked clips to the model group
- `useFrame()` to smoothly update rotation, position, and scale
- `PerspectiveCamera` for the presentation camera
- `ContactShadows` for the grounded shadow

## Model asset

The public asset URL is:

```text
/models/justice-gundam.glb
```

It is preloaded with `useGLTF.preload()` so the browser can begin fetching and parsing it before the Intro stage needs to display it.

The loaded scene is normalized at runtime because the authored GLB units and bind-pose bounds are not suitable for direct presentation.

### Runtime normalization

When the asset loads, the model system:

1. Calculates the complete scene bounding box.
2. Reads its authored height.
3. Scales the scene toward a target height of `3.4` Three.js units.
4. Applies a bind-pose inflation factor of `1.4`.
5. Centers the model on the X and Z axes.
6. Moves the lowest point to ground level on the Y axis.
7. Enables casting and receiving shadows on every mesh.
8. Sets regular material environment intensity to `0.9`.
9. Makes the `BEAM` material brighter with emissive intensity `2.4` and disables tone mapping on that material.

The inflation factor is necessary because the bind pose contains detached or expanded accessories. A plain bounding-box fit makes the assembled Idle pose look too small.

## Authored animation clips

The exact clip names are baked into the GLB. Do not rename them in code unless the source rig is also re-exported.

| UI name | Exact GLB clip | Playback | Automatic scroll use | Manual use |
| --- | --- | --- | --- | --- |
| Idle | `00-IDLE` | Repeating loop | Default resting state | Return to idle |
| Beam Saber | `01-SABER` | Play once | First Intro sequence action | Single click or Playground button |
| Rifle | `02-RIFLE` | Play once | Second Intro sequence action | Playground button |
| Shield | `03-SHILD` | Play once, then Idle | Never | Double-click or Playground button |
| Boomerang | `04-BOOMERANG` | Play once, then Idle | Never | Playground button, Shake button, device shake, or fast pointer gesture |
| Lifter | `05-LIFTER` | Play once, then Idle | Intro to Philosophy only | Playground button |
| Hold Pose | `Static` | Clamp and hold | Never | Playground button |

`03-SHILD` is intentionally misspelled because that is the clip name authored in the rig.

## Animation mixer behavior

### Idle

`00-IDLE` begins when the model mounts. It fades in over `0.4` seconds and loops indefinitely.

### One-shot actions

When a one-shot clip is requested:

1. Any previous `finished` listener is removed.
2. Other active actions fade out over `0.3` seconds.
3. The requested action resets to frame zero.
4. It uses `THREE.LoopOnce` for one repetition.
5. `clampWhenFinished` is enabled.
6. It fades in over `0.25` seconds.
7. When it finishes, Idle resets and fades in over `0.5` seconds.
8. The completed action fades out over `0.5` seconds.

Ordered sequences reuse the same mixer and crossfade rules. Each completed clip starts the next queued clip; the final clip returns to the repeating Idle loop. Intro uses this for `Beam Saber → Rifle → Idle`.

### Hold Pose

`Static` is the only action that does not automatically return to Idle. It stays clamped until another movement or `Return to idle` is requested.

### Interruptions

A newly requested animation may interrupt the currently playing animation. The mixer crossfades instead of stopping visually on a single frame. This is important when a user reaches the Playground while an automatic Lifter movement is ending.

## Public model control API

`GundamModel` exposes a small imperative API through its React ref:

```js
{
  play(clipName),
  playSequence(clipNames),
  playIdle(),
  clipNames,
  resetRotation()
}
```

### `play(clipName)`

Plays an authored action using the one-shot crossfade behavior. `Static` clamps instead of returning to Idle.

### `playSequence(clipNames)`

Plays an ordered list of authored one-shot clips, crossfading between them and returning to Idle after the final clip. Intro calls it once with `[CLIPS.SABER, CLIPS.RIFLE]`. A later `play()`, `playSequence()`, or `playIdle()` request safely interrupts the active sequence.

### `playIdle()`

Fades out all non-Idle actions and restores the repeating Idle loop.

### `clipNames`

Exposes the animation names detected in the loaded GLB. This is useful for asset verification.

### `resetRotation()`

Clears only the user's drag-added Y rotation. The scroll-controlled base orientation remains active.

## Automatic scroll choreography

### Core rule

The Gundam does not play an authored clip at every section boundary. It remains in Idle for observation, repositioning, descent, and landing preparation. Lifter is reserved for one movement:

```text
Intro -> Philosophy
```

The Philosophy flight plays `05-LIFTER` once while scroll-driven position, height, scale, and heading explain the left-to-right crossing. Creative, Projects, Experience, and the Playground approach remain in Idle while the damped transforms continue.

### State machine

`GundamStage` tracks:

- Previous stage index
- Current stage index
- Scroll direction
- Previous progress
- Last Lifter trigger time

The single flight boundary is centralized in `HOME_CHOREOGRAPHY.flightBoundaryIndexes`. A `0.006` stage hysteresis band prevents minor boundary jitter. A `1400` millisecond cooldown prevents rapid forward/reverse animation spam.

### Reverse scrolling

Reverse scrolling may reuse the Philosophy boundary. All later reverse transitions remain in Idle and move through the same damped transform system; the baked clip is not rewound.

### Automatic-action restrictions

The Intro sequence begins once the model is ready and the Intro panel has become visible. It is the only automatic combat sequence:

```text
01-SABER -> 02-RIFLE -> 00-IDLE
```

No scroll boundary may automatically trigger:

- `01-SABER`
- `02-RIFLE`
- `03-SHILD`
- `04-BOOMERANG`
- `Static`

These clips remain available through Playground controls after the narrative journey hands control to the visitor.

## Scroll progress

The sticky Gundam wrapper is measured as a normalized value:

```js
progress = clamp(
  -wrapper.getBoundingClientRect().top /
    (wrapper.offsetHeight - window.innerHeight),
  0,
  1
);
```

Scroll and resize listeners keep the value current. State updates smaller than `0.0005` are ignored to reduce needless React rendering.

### Stage ranges

| Stage | Normalized range |
| --- | ---: |
| Intro | `0.000` to `0.105` |
| Philosophy | `0.105` to `0.225` |
| Skills / Proof | `0.225` to `0.315` |
| Creative Interlude | `0.315` to `0.405` |
| Selected Projects | `0.405` to `0.745` |
| Experience / Current Focus | `0.745` to `0.900` |
| Playground | `0.900` to `1.000` |

The opening spacer is `250vh`. The final landing spacer is `190vh`, giving Playground enough scroll distance for landing and interaction before the footer appears. Browser measurements at the required responsive widths place the semantic DOM anchors close to these ranges.

### Panel fade ranges

| Panel | Fade in | Fully visible | Fade out |
| --- | --- | --- | --- |
| Intro | `0.000` to `0.008` | `0.008` to `0.085` | `0.085` to `0.105` |
| Philosophy | `0.105` to `0.120` | `0.120` to `0.205` | `0.205` to `0.225` |
| Playground | `0.895` to `0.910` | `0.910` onward | No pre-footer fade-out |

The Playground fade range intentionally extends beyond `1` in the configuration so it remains fully visible at the end of the wrapper.

## Position path

Position changes now follow the actual Home-page story instead of mechanically alternating sides.

| Stage | Position behavior |
| --- | --- |
| Intro | Starts already settled on the left at `x = -1.88`, `y = 0`, scale `1.30`, and heading `11°` |
| Philosophy | Rises and crosses left to right, settling near `x = 1.88` |
| Skills | Holds on the supporting right edge near `x = 2.25` |
| Creative | Flies from the right toward the middle, gains height, and turns three-quarter |
| Projects | Steps to the far supporting edge near `x = 2.50` and makes only minor adjustments |
| Experience | Lowers progressively while moving toward the final right-side landing position |
| Playground | Settles at `x = 1.70`, `y = 0` on desktop |

The final X position keeps the controls on the left and the landed model on the right.

## Model scale

The scale is intentionally larger in Intro and Playground, where the model is the primary subject, and smaller through the content-heavy sections.

| Stage | Approximate desktop scale |
| --- | ---: |
| Intro | `1.30` |
| Philosophy | `1.00` to `1.12`, allowing for Lifter's wide fins |
| Skills | `0.76` to `0.78` |
| Creative | `0.78` to `0.86` |
| Projects | `0.64` to `0.68` |
| Experience | `0.72` to `1.08` during descent |
| Playground | `1.18` at the inspection-friendly final angle |

This prevents excessive blank space in the Intro and final screen while keeping the editorial text readable.

## Rotation and 11-degree Intro heading

The Intro must begin at an 11-degree heading. The Three.js model uses a negative Y rotation so the HUD can display a positive heading:

```js
const INTRO_HEADING_DEG = 11;
const introRotationY = THREE.MathUtils.degToRad(-INTRO_HEADING_DEG);
```

Heading is stage-authored rather than continuously spun. The intended headings are approximately 11 degrees in Intro, 28 to 34 degrees in Philosophy, 22 degrees in Skills, 38 to 52 degrees in Creative, 16 to 18 degrees in Projects, 22 to 48 degrees during descent, and 53 degrees in Playground.

The HUD heading is derived from the transform:

```js
const rotationDeg = Math.round(
  ((-transform.rotationY * 180) / Math.PI) % 360
);
```

At the beginning of Intro, the HUD should therefore read `HEADING / 11°`.

## Smooth transform motion

The scroll configuration supplies target position, scale, and base rotation. `useFrame()` damps the visible group toward those targets every rendered frame.

Current damping values are:

| Property | Damping factor |
| --- | ---: |
| Rotation | `4` |
| Position | `3` |
| Scale | `3` |

Damping avoids abrupt jumps when scroll progress changes quickly. User drag rotation is added to the scroll rotation before damping:

```text
visible Y rotation = scroll-controlled base rotation + manual drag rotation
```

## Model visibility through the journey

The model remains present in the single persistent Canvas, but its visual dominance changes by section through scale, edge placement, vertical position, background treatment, and restrained opacity.

| Stage | Canvas opacity range |
| --- | ---: |
| Intro | `1.00` |
| Philosophy | `0.82` to `0.95` |
| Skills | Approximately `0.72` |
| Creative | `0.82` to `1.00` |
| Projects | `0.62` to `0.68` |
| Experience | `0.68` to `0.90` |
| Playground | `1.00` |

Canvas pointer events are disabled for every pre-Playground stage regardless of opacity. They become active only after the Playground panel has faded in and the stage state is `playground`.

## Direct model interaction

All behavior in this section is enabled only in Playground. Before Playground, the Canvas ignores pointer input so the visitor cannot interrupt the directed choreography.

### Hover

Inside Playground, hovering over the model changes the cursor to `grab`. While dragging, the cursor changes to `grabbing`.

### Drag to inspect

Horizontal pointer movement rotates the model around the Y axis:

```text
manual rotation delta = horizontal pointer delta × 0.009 radians
```

The pointer is captured on press so rotation continues even if the pointer briefly leaves the mesh. A movement of at least `6` pixels is treated as a drag rather than a click.

### Single click

A single click plays `01-SABER`. It waits `280` milliseconds before firing so the code can distinguish it from a double-click.

### Double-click

A second click within `280` milliseconds cancels the pending Saber action and plays `03-SHILD`.

### Reset view

`Reset view` sets the user's manual rotation offset back to zero. The Gundam then smoothly returns to the current scroll-controlled heading.

## Playground

The Playground is the last model stage and is immediately above the footer. It is active when its panel opacity is greater than `0.4`.

### Layout

- Left half: control surface and instructions
- Right half: full-size Gundam at the final landing position
- Desktop: two-column layout with a wide gap
- Mobile: controls move toward the lower part of the viewport and become horizontally scrollable

### Buttons

| Button | Action |
| --- | --- |
| Beam Saber | Plays `01-SABER` |
| Shield | Plays `03-SHILD` |
| Rifle | Plays `02-RIFLE` |
| Boomerang | Plays `04-BOOMERANG` |
| Lifter | Plays `05-LIFTER` |
| Hold Pose | Plays `Static` and holds the final pose |
| Shake | Plays `04-BOOMERANG` |
| Return to idle | Restores `00-IDLE` |
| Reset view | Clears the drag rotation offset |

### Fast pointer gesture

On desktop, a fast pointer movement can trigger Boomerang while the Playground is active.

- Velocity threshold: `2.6` pixels per millisecond
- Cooldown: `1100` milliseconds
- Ignored while a pointer button is held
- Ignored over buttons and links
- Disabled outside the active Playground

### Device shake

On supported mobile devices, the user can explicitly enable motion access. A shake triggers Boomerang when:

```text
abs(x) + abs(y) + abs(z) > 17
```

The same `1100` millisecond cooldown prevents repeated triggering. iOS-style permission is requested only after the user presses `Enable motion`. If permission is denied, all explicit controls remain available.

## Camera

The presentation uses one perspective camera:

```text
Position: [0, 1.75, 7.6]
Field of view: 36 degrees
```

This narrow field of view keeps the Gundam visually strong without the distortion of a wide-angle camera.

## Lighting and shadow

The stage uses four light contributions:

| Light | Position or colors | Intensity | Purpose |
| --- | --- | ---: | --- |
| Ambient | Global | `0.35` | Basic shadow detail |
| Hemisphere | Sky `#3a3a42`, ground `#0a0a0a` | `0.40` | Cool environmental separation |
| Warm key | `[4, 6, 4]`, `#fff3dd` | `1.60` | Main form and material definition |
| Gold rim | `[-3, 3, -5]`, `#c9a24b` | `1.80` | Brand-colored silhouette separation |
| Cool fill | `[-5, 2, 3]`, `#6b7a8f` | `0.40` | Recovers detail on the opposite side |

The warm key casts a `1024 × 1024` shadow map. `ContactShadows` adds a soft ground shadow with:

```text
Position: [0, 0.01, 0]
Opacity: 0.55
Scale: 12
Blur: 2.4
Far distance: 4
Color: #000000
```

## Canvas behavior

The model is rendered in one persistent React Three Fiber Canvas.

```text
Shadows: enabled
Device pixel ratio: 1.0 to 1.8
Touch action: pan-y
```

`touch-action: pan-y` allows vertical page scrolling while preserving horizontal drag inspection.

The stage includes:

- A loading status while the GLB and animation data initialize
- A dark radial stage background
- A vignette overlay
- A top-right stage and heading HUD on desktop
- A bottom progress line
- A readable fallback when WebGL is unavailable

## Responsive behavior

### Desktop and tablet

- Text and model use separate halves of the viewport.
- Intro copy is on the right while the model is on the left.
- Philosophy copy is on the left while the model moves to the right.
- Playground controls are on the left while the landed model is on the right.
- The Gundam uses the largest presentation scales in Intro and Playground.

### Mobile at 720 pixels and below

- Split panels switch to a vertically composed layout.
- Copy is centered and constrained to approximately `90vw`.
- Bottom padding includes the device safe area.
- The top-right HUD is hidden.
- Playground controls become a horizontal, touch-scrollable row.
- The landed Playground model remains draggable without preventing vertical scrolling.

## Accessibility and reduced motion

The 3D canvas is decorative to screen readers because the surrounding text and controls describe the experience. The Playground control group has an accessible label and every movement is available through a native button.

Required behavior:

- The portfolio content remains readable if WebGL fails.
- Motion permission is never requested without a user gesture.
- Device motion is optional.
- Drag is not the only way to operate the model.
- Button focus states must remain visible in the site's global focus treatment.
- Reduced-motion users should not be forced through aggressive scroll-triggered animation.
- For `prefers-reduced-motion: reduce`, automatic section actions should be disabled or reduced to a quick Idle-to-position transition, while explicit Playground actions may still play when requested by the user.

## Performance rules

1. Keep one Canvas and one Gundam instance for the entire journey.
2. Do not mount a second model in the Playground.
3. Preload the GLB.
4. Animate transforms rather than layout properties.
5. Keep the DPR capped at `1.8`.
6. Keep scroll listeners passive.
7. Ignore insignificant scroll progress changes.
8. Remove mixer listeners, timers, pointer state, and device listeners during cleanup.
9. Do not create a new material or geometry every frame.
10. Re-test frame rate whenever the GLB, shadow resolution, or lighting count changes.

## Cleanup and lifecycle

When the model or stage unmounts, the implementation must:

- Clear the delayed single-click timer.
- Remove the active animation mixer `finished` listener.
- Stop all animation actions.
- Restore the document cursor.
- Clear choreography timers.
- Remove scroll and resize listeners.
- Remove `devicemotion` and global `pointermove` listeners.
- Release captured pointer state when dragging ends or is cancelled.

## Current implementation alignment

The working implementation matches this document: Intro starts settled at an 11-degree heading and runs Beam Saber → Rifle → Idle once, only the Philosophy crossing automatically uses Lifter, all direct model control is Playground-only, and the final sticky Canvas ends at the footer boundary.

## Verification checklist

### Asset and loading

- [ ] `/models/justice-gundam.glb` loads without a 404 error.
- [ ] All seven clip names are present exactly as documented.
- [ ] The model is centered and grounded after normalization.
- [ ] The beam material glows without losing its color to tone mapping.
- [ ] A loading message appears while the model initializes.
- [ ] The page remains usable if WebGL is unavailable.

### Intro

- [ ] No Gundam is shown inside the Hero.
- [ ] The Gundam begins already settled on the left in the Intro.
- [ ] The Intro HUD starts at `HEADING / 11°`.
- [ ] The model reaches the large Intro presentation scale.
- [ ] The Intro text has the right half and the Gundam has the left half.
- [ ] Intro plays Beam Saber once, then Rifle once, then returns to Idle.

### Automatic movement

- [ ] Intro to Philosophy plays Lifter once.
- [ ] Creative, Projects, Experience, and Playground arrival remain in Idle.
- [ ] Lifter returns cleanly to Idle after each arrival.
- [ ] Automatic scrolling never restarts Saber or the Intro sequence.
- [ ] Automatic scrolling never plays Shield.
- [ ] Automatic scrolling never restarts Rifle or the Intro sequence.
- [ ] Automatic scrolling never plays Boomerang.
- [ ] Automatic scrolling never enters Hold Pose.
- [ ] Slow scrolling around a boundary does not restart Lifter repeatedly.
- [ ] Reverse scrolling does not create an animation-trigger loop.

### Scroll path

- [ ] The same model instance persists from Intro to Playground.
- [ ] Horizontal crossings leave approximately half the viewport for text.
- [ ] The model becomes smaller and quieter through dense editorial content.
- [ ] The model becomes large again while approaching the Playground.
- [ ] Rotation continues smoothly from the 11-degree Intro offset.
- [ ] Position, scale, and rotation do not snap on stage boundaries.

### Direct interaction

- [ ] Before Playground, hover does not show a grab cursor.
- [ ] Before Playground, drag, click, and double-click do nothing.
- [ ] Hover shows a grab cursor.
- [ ] Horizontal drag reveals other sides of the model.
- [ ] Vertical page scrolling still works on touch devices.
- [ ] A drag of 6 pixels or more does not trigger a click action.
- [ ] Single click plays Beam Saber after click disambiguation.
- [ ] Double-click plays Shield and cancels the pending Beam Saber action.
- [ ] Reset view removes only the manual rotation offset.

### Playground

- [ ] The Playground is the final screen immediately above the footer.
- [ ] The Gundam lands on the right half and remains there.
- [ ] The model does not move into or below the footer.
- [ ] All six authored action buttons trigger the correct exact clip.
- [ ] Hold Pose remains clamped until another action or Idle is requested.
- [ ] Return to idle restores the repeating Idle clip.
- [ ] Shake button triggers Boomerang.
- [ ] Fast pointer movement triggers Boomerang only while Playground is active.
- [ ] Device shake requires explicit permission where the browser requires it.
- [ ] Denied motion permission does not disable the buttons.

### Responsive and performance

- [ ] The two-column staging works at desktop widths.
- [ ] The model remains large without clipping important body parts.
- [ ] The Playground controls remain reachable on a small laptop viewport.
- [ ] The mobile control row scrolls horizontally.
- [ ] Safe-area padding prevents controls from touching the bottom edge.
- [ ] The top-right HUD is hidden on narrow mobile screens.
- [ ] No duplicate Canvas or Gundam instance appears.
- [ ] No listener, timer, or cursor state survives component unmount.
- [ ] Animation remains smooth at the capped DPR.

## Definition of done

The Gundam system is complete when one normalized model starts already settled after the Hero at an 11-degree heading, opens once with Beam Saber → Rifle → Idle, uses Lifter only for the Philosophy crossing, supports every later Home section through Idle and damped transforms without obscuring content, hands interaction to the visitor only in the final Playground, and never moves below the Playground.
