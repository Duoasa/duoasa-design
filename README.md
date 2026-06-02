<p align="center">
  <img alt="Duoasa logo" src="assets/readme/duoasa-logo.png" width="320">
</p>

<h1 align="center">Duoasa Design</h1>

<p align="center">
  An AI-assisted personal design site built with OpenAI Codex, WebGL motion, and rule-driven static front-end workflows.
</p>

<p align="center">
  <a href="https://design.duoasa.com"><img alt="Live site" src="https://img.shields.io/badge/site-design.duoasa.com-111111?style=for-the-badge"></a>
  <img alt="Built with Codex" src="https://img.shields.io/badge/built%20with-OpenAI%20Codex-111111?style=for-the-badge">
  <img alt="Static frontend" src="https://img.shields.io/badge/frontend-HTML%20%2F%20CSS%20%2F%20JS-2F80ED?style=for-the-badge">
  <img alt="Cloudflare Workers" src="https://img.shields.io/badge/deploy-Cloudflare%20Workers-F38020?style=for-the-badge">
</p>

<p align="center">
  <a href="https://design.duoasa.com">Website</a>
  &middot;
  <a href="cases/README.md">Rules</a>
  &middot;
  <a href="#motion-and-open-source-references">Motion References</a>
  &middot;
  <a href="#codex-collaboration-workflow">Codex Workflow</a>
  &middot;
  <a href="#deployment">Deployment</a>
</p>

---

## Overview

Duoasa Design is the personal design site of XuChenChen / Duoasa and an AI-assisted design-to-code project built with [OpenAI Codex](https://openai.com/codex/).

This repository is shared for the developer community as a record of how a designer can work with a coding agent to turn visual direction, interaction rules, motion references, and maintenance constraints into a static production website.

## What This Project Explores

- Turning natural-language design intent into front-end implementation with Codex.
- Keeping human design judgment in control while using AI for code execution.
- Writing durable Markdown rules so future AI sessions can preserve page structure and deployment behavior.
- Combining static HTML, CSS, JavaScript, WebGL, and motion libraries without adding a heavy build pipeline.
- Treating visual experiments as maintainable product surfaces instead of one-off demos.

## About Duoasa

Duoasa is a UI/UX designer interested in the overlap between product logic, visual systems, interaction rhythm, motion design, and AI-assisted creation.

The design direction of this site favors clear hierarchy, precise spacing, responsive motion, and expressive atmosphere. It uses code as a medium for shaping visual memory, not only as a way to publish static pages.

## Codex Collaboration Workflow

This site was built through an iterative workflow with Codex:

| Step | Practice |
| --- | --- |
| 1 | Duoasa defines the design direction, content boundaries, motion references, and editing constraints. |
| 2 | Codex reads the existing codebase before making changes and follows the local implementation style. |
| 3 | Repeated decisions are moved into Markdown rules instead of staying only in conversation. |
| 4 | Finished pages are isolated so new experiments do not accidentally affect published pages. |
| 5 | Visual output is reviewed manually, then refined through additional design and code passes. |

For AI-assisted front-end work, the useful pattern is not a single prompt. The useful pattern is a loop: intent, implementation, review, rule-making, and controlled iteration.

## Rule Documents

The core maintenance rule document is:

- [Case Study Page Independence Rules](cases/README.md)

It defines how project detail pages are created, frozen, edited, and deployed. Key principles include:

- every finished detail page owns its own HTML, CSS, and JavaScript files
- page-level styles are scoped to the current page
- project-specific assets stay inside the matching project asset folder
- local testbeds are excluded from public deployment until explicitly promoted
- cache-version query strings are updated when page CSS or JavaScript changes

## Motion And Open-source References

The site combines hand-written interaction code with adapted open-source motion and WebGL references. Each reference was adjusted to fit the static site structure, responsive layout, performance constraints, and Duoasa Design visual direction.

| Layer | Use in this site | Reference |
| --- | --- | --- |
| Motion system | Entrance motion, scroll reveals, parallax moments, and scroll-controlled frame sequences | [GSAP](https://gsap.com/docs/v3/) + [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) |
| Creative component references | Orb, glass, terminal, prism, and prismatic visual experiments | [React Bits](https://www.reactbits.dev/) |
| Hero atmosphere | Adapted shader background for the homepage hero | [React Bits Orb](https://www.reactbits.dev/backgrounds/orb) |
| Glass experiments | Fluid glass and SVG-filter glass surface explorations | [Fluid Glass](https://www.reactbits.dev/components/fluid-glass), [Glass Surface](https://www.reactbits.dev/components/glass-surface) |
| WebGL components | Material rendering and 3D glass preview support | [Three.js](https://threejs.org/docs/), [React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/introduction), [Drei](https://github.com/pmndrs/drei), [maath](https://github.com/pmndrs/maath) |
| Shader backgrounds | Terminal and prism-style lightweight WebGL effects | [OGL](https://github.com/oframe/ogl), [Faulty Terminal](https://www.reactbits.dev/backgrounds/faulty-terminal), [Prism](https://www.reactbits.dev/backgrounds/prism), [Prismatic Burst](https://www.reactbits.dev/backgrounds/prismatic-burst) |

## Technical Shape

| Area | Detail |
| --- | --- |
| Frontend | Static HTML, CSS, and JavaScript |
| Build step | None required for the main site |
| Assets | Localized vendor assets where stability matters |
| Page model | Independent case-study page files for safer AI-assisted iteration |
| Deployment | [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) |

## Deployment

Production site:

[https://design.duoasa.com](https://design.duoasa.com)

The Cloudflare Worker configuration lives in [wrangler.jsonc](wrangler.jsonc).

Pushing to `main` triggers the production deployment.

## Repository Purpose

This repository is shared for people interested in AI-assisted interface development, especially designers and developers exploring how coding agents can participate in real front-end production work.

The project is intentionally small in stack size but specific in process: keep design judgment human, make constraints explicit, let the agent work inside those constraints, and treat the codebase as a living collaboration record.
