# Duoasa Design Agent Guidelines

## Required Rule Files

Before making changes in this repository, check whether the task matches one of the rule files below.

### Project Case Study Pages

Read `cases/README.md` before creating, freezing, editing, or refactoring any second-level project case study page.

This applies to files under:

- `cases/*.html`
- `cases/*.css`
- `cases/*.js`
- `assets/cases/**`

Follow the independence rules in that document. Finished case study pages must remain isolated unless the user explicitly requests a global change.

### External Interaction Components

Read `docs/external-interaction-component-guidelines.md` before importing, adapting, or re-implementing any external open-source interaction component.

This applies to:

- animated backgrounds;
- canvas or WebGL effects;
- shader-based visuals;
- scroll, pointer, gyroscope, webcam, or input-reactive effects;
- exported code from component galleries or creative coding libraries.

Match the source rendering pipeline before visual tuning. In particular, verify defaults, color space, post-processing, alpha blending, DPR, and page-level compositing.

## General Editing Notes

- Keep changes scoped to the user-requested surface.
- Preserve existing project patterns before introducing new abstractions.
- Update cache query strings when changed CSS or JavaScript must be reloaded in local preview or production.
- Verify syntax and whitespace before handoff.

