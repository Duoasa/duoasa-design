# Case Study Page Independence Rules

## Purpose

This document defines the rules for creating, freezing, editing, and maintaining second-level project case study pages.

The core principle is simple: every finished project detail page must be independent. Changes to one project detail page must not affect any other project detail page.

## Playground Rules

1. The playground page is used only for creating and testing new project detail pages.

2. The playground may be used to test:
   - copy
   - layout
   - images
   - motion
   - interactions

3. The playground must remain independent from finished project pages.

4. Updating the playground must not affect any finished project detail page.

## Local Testbed Exclusion Rule

1. `neotaste-quest` is a local-only testbed. It must not be treated as a public case-study page.

2. Do not add a homepage entry, public navigation entry, or internal website link to `cases/neotaste-quest.html` unless the user explicitly promotes it to a public project.

3. Do not include `cases/neotaste-quest.*`, `assets/cases/neotaste-quest/`, or `assets/neotaste-quest-card.svg` in production website deployments.

4. Keep the `neotaste-quest` paths listed in `.assetsignore` so Cloudflare static asset uploads exclude the testbed from the public site.

## Required File Structure

1. Every finished project detail page must have its own HTML, CSS, and JavaScript files.

2. When a project detail page is approved, duplicate the playground into a dedicated project file set:

   ```text
   cases/{project-slug}.html
   cases/{project-slug}.css
   cases/{project-slug}.js
   ```

3. A finished project detail page must reference only its own page-level CSS and JavaScript:

   ```html
   <link rel="stylesheet" href="{project-slug}.css?v={cache-version}">
   <script src="{project-slug}.js?v={cache-version}"></script>
   ```

4. Page-level CSS and JavaScript must not be shared between finished project detail pages.

5. There are no exceptions to this rule. Every second-level project detail page must have its own independent HTML, CSS, and JavaScript files.

## Page Scope Rules

1. Every project detail page must use a unique page scope class:

   ```text
   case-{project-slug}
   ```

2. Page-level styles must be scoped under the current project page class.

3. A project detail page must not rely on playground-specific classes, stylesheets, or scripts after it has been frozen.

4. A finished project detail page must not rely on another project page's scope class.

## Editing Rules

1. When editing a finished project detail page, only modify that project's own files:
   - `cases/{project-slug}.html`
   - `cases/{project-slug}.css`
   - `cases/{project-slug}.js`
   - `assets/cases/{project-slug}/...`

2. Do not modify other project detail pages unless the user explicitly asks for that page to be changed.

3. Do not modify shared site files unless the requested change requires a global navigation, routing, or homepage entry update.

## Asset Storage Rules

1. Project-specific assets must be stored in a dedicated project asset directory:

   ```text
   assets/cases/{project-slug}/...
   ```

2. Project assets should be organized by type when useful:

   ```text
   assets/cases/{project-slug}/images/...
   assets/cases/{project-slug}/videos/...
   assets/cases/{project-slug}/sequence/...
   assets/cases/{project-slug}/motion/...
   assets/cases/{project-slug}/icons/...
   ```

3. A project detail page must not depend on another project's asset directory.

4. Project-specific visual assets must not be stored in global shared asset folders.

5. Shared base assets may be used only when they are genuinely global assets, such as:
   - fonts
   - common icons
   - reusable site-wide images
   - global design variables

## Resource Path Rules

1. Resource references in HTML, CSS, and JavaScript must match the actual file storage paths.

2. After copying or migrating a page, verify all references to:
   - images
   - videos
   - sequence frames
   - background images
   - motion assets
   - data paths

3. A finished project detail page must not keep references to:
   - playground assets
   - another project's assets
   - removed assets
   - outdated file paths

## Cache Version Rules

1. Any time a finished project detail page is created or modified, update the cache version on changed CSS and JavaScript references.

2. Use cache-version query strings to prevent browsers from loading stale files:

   ```html
   <link rel="stylesheet" href="{project-slug}.css?v={cache-version}">
   <script src="{project-slug}.js?v={cache-version}"></script>
   ```

3. Cache versions must also be considered for critical image sequences or motion assets when stale browser cache could break the page.

## Pre-Freeze Checklist

Before turning a playground page into a finished project detail page, verify that:

- the homepage project entry links to the finished project detail page
- the detail page references its own CSS and JavaScript
- the CSS is scoped under the current project page class
- HTML, CSS, and JavaScript resource references match the current project's asset directory
- no playground-only class, stylesheet, or script reference remains
- no asset reference points to another project's asset directory
- no removed or obsolete asset is still referenced
- changed CSS and JavaScript references include an updated cache version

## Frozen Page Rule

Once a project detail page is finished, it should be treated as a frozen independent version. Future changes must stay inside that project's own file structure unless the user explicitly requests a global change.
