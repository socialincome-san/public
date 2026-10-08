# design-sync notes

Repo-specific gotchas for syncing `design-system/` to Claude Design.

## Build

- [GENERAL] The design system ships TypeScript source only (no `dist/`). `node .design-sync/build-dist.mjs`
  (`cfg.buildCmd`) builds a gitignored `design-system/dist/`: an esbuild ESM bundle of every non-story module
  under `src/components/`, a tsc `.d.ts` tree, and a `dist/package.json` the converter reads (`cfg.entry`).
  Re-run it whenever the DS source changes, together with the reference Storybook.
- [GENERAL] `next/link` and `next/image` are aliased to plain `<a>`/`<img>` shims (`.design-sync/shims/`) in
  that build. Claude Design has no Next.js router or image optimizer.
- [GENERAL] Run the converter with `--node-modules node_modules` (repo root; npm workspaces hoist everything).
- Reference Storybook: `cd design-system && npx storybook build -c .storybook -o ../.design-sync/sb-reference`.
- Playwright: the container's cached chromium is build 1194, so `.ds-sync/` pins `playwright@1.56.1`.
- The full converter build takes several minutes (91 story-module previews, then tsc-backed `.d.ts`).

## Config decisions

- [GENERAL] Component files are kebab-case (`button/button.tsx`), so the converter's import redirect can't map
  them to exports (`Button`). `cfg.storyImports.shim: ["/design-system/src/components/"]` sends every story
  import of a component module to the shipped bundle global. Without it, each preview bundled its own source
  copy (200-580 KB previews, ~20 min builds) and verified nothing about the bundle.
- `titleMap`: Foundations pages (Colors, Typography, Spacing & Layout, Radius, Shadows, Motion) are token docs,
  not components - excluded. Multi-export story files map to one representative export:
  DataTableCells -> DataTableTextCell, DataTableStates -> DataTableEmptyState, Logo -> SocialIncomeLogo,
  Custom Icons -> QuoteIcon, Social Icons -> InstagramIcon. Every other export of those files is still on the
  bundle global.
- CSS comes from the Storybook build (`[CSS_FROM_STORYBOOK]`): Tailwind v4 compiles only classes used in
  `src/`, so the shipped stylesheet holds exactly the DS's own class vocabulary.

## Grading

- [GENERAL] Framing: Storybook uses `layout: 'centered'` and crops tight; previews render on a 900px page.
  Full-width content (fullWidth buttons, accordions, containers) stretches in the preview and shrinks in
  Storybook. Judge the component, not the frame; compare raw PNGs (`_screenshots/compare/raw/`) for size.
- [GENERAL] Stories that import `next/image` directly crash the preview (`process is not defined`). Own the
  preview and import the shim: `import Image from '@ds-stories/.design-sync/shims/next-image';` (Card).
- [GENERAL] `CountryFlag` loads `/assets/flags/<code>.svg`, an app-served path. Neither the reference server nor
  Claude Design serves it, so both sides show the letter-code fallback. That is a faithful match.
- Overlays (Dialog etc.) render their closed trigger in both Storybook and the preview.
- [GENERAL] The compare sheet scales each column to its widest shot, so small or content-sized components look
  tiny next to Storybook. Crop the raw `__ds.png` to content and view 1:1 next to `__sb.png` before judging size.
- [GENERAL] `/assets/...` images (flags, `/assets/storybook/placeholder-portrait.svg`) are app-served: both sides
  show the fallback (initials, country code). Faithful match (CountryFlag, Avatar, AvatarStack).
- [GENERAL] [ASSETS_BLOCKED]: this cloud environment's network policy denies `a.storyblok.com` and
  `placehold.co`, so remote story images break on both panels. Card "With Content" and PartnershipBadge
  "Default" stay ungraded until those hosts are allowed; then `compare.mjs --force --components Card,PartnershipBadge`.
- Carousel "Cards" has no width limit: Storybook grows to show all 5 cards, the 900px preview scrolls. Framing.
