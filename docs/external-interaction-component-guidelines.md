# External Interaction Component Integration Guidelines

## Purpose

This document defines the integration rules for external open-source interaction components, especially visual components that rely on canvas, WebGL, shaders, animation loops, scroll interaction, or post-processing effects.

Read this document before importing, adapting, or re-implementing any external interactive component.

## Scope

These rules apply when the site uses an external component for:

- animated backgrounds;
- WebGL or canvas effects;
- shader-based visual systems;
- scroll-driven interactions;
- pointer, gyroscope, webcam, or input-reactive effects;
- third-party UI animation snippets;
- exported code from component galleries or creative coding libraries.

## Source Fidelity Contract

The implementation must first identify the official source behavior before adapting it.

- Preserve the original component's rendering pipeline unless there is a documented reason to change it.
- Record every intentional deviation from the source component.
- Do not assume that omitted props equal zero. Check the component defaults.
- Do not replace rendering behavior with CSS brightness, opacity, blur, or filters unless the source component uses the same mechanism.
- Treat demo-site controls as a configuration layer, not as the full implementation.

## Required Source Review

Before implementation, inspect and document:

- imported packages and runtime dependencies;
- component default props;
- shader code and uniforms;
- renderer setup;
- device pixel ratio handling;
- color space and tone mapping;
- alpha, blending, and transparency behavior;
- post-processing passes;
- resize behavior;
- animation timing;
- reduced-motion behavior;
- fallback behavior when required APIs are unavailable.

## Rendering Pipeline Checklist

For canvas, WebGL, or shader components, verify the following before visual QA.

### Color Space

- Confirm whether colors are authored in sRGB, converted to linear, and converted back to sRGB for display.
- If the source uses Three.js `SRGBColorSpace`, reproduce equivalent output encoding in a raw WebGL adaptation.
- Do not pass linear RGB values directly to the browser display buffer unless that is the intended final output.

### Tone Mapping

- Check whether the source uses tone mapping.
- If tone mapping is disabled in the source, avoid introducing implicit contrast or exposure changes.

### Post-Processing

- Identify whether the source uses bloom, blur, chromatic aberration, vignette, noise, compositing, or custom render passes.
- If post-processing is part of the source look, reproduce it or explicitly document why it is omitted.
- Do not judge shader parameters until the post-processing chain matches the source.

### Alpha And Blending

- Verify whether glow, aura, or bloom data survives transparent canvas compositing.
- If a shader writes visible glow into RGB but not alpha, the glow may disappear when blended over the page background.
- When using an intermediate framebuffer, store source RGB before final page compositing.

### Device Pixel Ratio

- Match the source DPR cap during visual comparison.
- If DPR is reduced for performance, document the tradeoff and re-check line thickness, glow radius, and aliasing.

### CSS Compositing

- Inspect computed styles for all wrapper layers.
- Confirm there is no unintended `opacity`, `filter`, `mix-blend-mode`, `mask`, overlay, or pseudo-element dimming the effect.
- Keep decorative page overlays separate from the component validation pass.

## Parameter Parity Rules

- Copy only parameters that exist in the source component.
- Check default values for parameters not listed in the exported usage snippet.
- Keep visual tuning parameters close to the component mount code.
- Separate source-level parameters from local integration parameters such as DPR caps, cache versions, and fallback selectors.
- When the user tunes values manually, preserve those values unless the rendering pipeline itself is incorrect.

## Performance Rules

- Avoid unbounded DPR on fullscreen WebGL effects.
- Pause animation when the component is outside the viewport or the document is hidden.
- Prefer one animation loop per visual system.
- Keep post-processing passes as small as the visual goal allows.
- Re-test performance after adding bloom, blur, or multi-sample shader passes.

## Visual QA Rules

After implementation, verify:

- the effect is visible on first load;
- the effect fills the intended container;
- the effect matches the source preview in brightness, glow, color, perspective, and motion timing;
- the effect does not hide important text or controls;
- theme switching does not accidentally restyle a fixed-theme effect;
- reduced-motion users receive an acceptable fallback;
- the component does not create layout shifts.

## Documentation Requirements

Each imported interaction component should include a short local note with:

- source name and URL;
- source version or retrieval date when available;
- exact user-facing parameters;
- local integration parameters;
- known deviations from the source;
- performance constraints;
- verification steps.

## Review Questions

Before considering the integration complete, answer:

1. Does the local rendering pipeline match the source pipeline?
2. Are color space, tone mapping, and post-processing equivalent?
3. Are default props correctly preserved?
4. Are transparent and glowing pixels composited correctly?
5. Are local performance optimizations documented?
6. Has the effect been verified in the actual page context, not only in isolation?

