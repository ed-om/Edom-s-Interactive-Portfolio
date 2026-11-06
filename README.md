# Edom — Portfolio

A personal portfolio told through an original mushroom avatar. The experience begins with a complete illustrated PC workstation on a desk. Scrolling zooms into the monitor, reveals a Linux-style terminal, and lets the visitor launch the story with a command. Six scroll-driven chapters lead to film credits; the final terminal lets the visitor type `exit` to zoom back out to the same workstation.

## Stack
- React + TypeScript + Vite
- GSAP + ScrollTrigger for the avatar camera and chapter choreography
- CSS/SVG for the terminal workstation, botanical details, textures, and responsive scene art

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

## Terminal commands

The initial view is the whole PC on a table. Scroll down to zoom into its screen and reveal the terminal. Try `help`, `ls`, or `cat about.txt`, then run `./open.sh` to enter the portfolio. Scroll through the story. At the end, type `exit` to reverse the camera move and return to the same PC-and-table scene. The desktop reopen control restarts the experience.

## Chapters
1. Curiosity — mushroom cap
2. The person — face and lavender hair
3. Things I build — project case files
4. My toolkit — skills
5. The journey — AASTU, INSA, DSA community, and current AWS SBG at AASTU Cloud and DevOps track enrollment
6. What's next — future interests and contact links

The animation respects `prefers-reduced-motion`. For reduced-motion users, the existing story layout provides a static alternative.


## Responsive behavior

The workstation is sized against both the viewport width and height. At the zoom point, the terminal panel expands out of the monitor display to become the reading surface itself; portrait screens use a contain-style camera fit so the prompt is not cropped, while widescreen views fill the available frame. The same camera geometry is used by the closing `exit` sequence so the view returns to the desktop and table.

For browser accessibility settings that request reduced motion, the startup scene leaves the terminal visible on the PC screen without the scroll-zoom, and the story becomes a vertical chapter document rather than overlapping animated panels.


## Layout system (v4.1)

`StoryExperience` decides one layout mode per window size and writes it to `data-layout` (and a `--ui` scale) on `.story-stage`:

| mode | when | composition |
| --- | --- | --- |
| `side` | width >= 1000 and landscape (aspect >= 1.3) | figure and card share the stage and alternate sides |
| `stack` | other desktop sizes | one centred card under the figure |
| `mobile` | width <= 800 | bottom sheet under the figure |

The camera maths (`cameraFrames`, `wideFrame`) and the CSS read the same mode, so they cannot disagree. Tune the breakpoints in `layoutFor()` and the card sizes in the "Layout system" block at the end of `styles.css`.

`gsap.matchMedia()` only runs its callback when at least one condition matches, so the conditions cover phone, desktop and reduced motion. If motion never starts, the stage falls back to a calm static composition (`data-motion` is only set to `on` once the animation exists), and a watchdog lifts the opening veil after 12 seconds.

## Ending commands

At the end of the story the terminal accepts `stay` (go back to the page and keep exploring; the footer links stay available) and `exit` (close the session). `reopen` replays the story. `stay` and `exit` are also clickable buttons under the prompt.
