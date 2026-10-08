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
- [GENERAL] `CountryFlag` loads `/assets/flags/<code>.svg`, an app-served path. Claude Design doesn't serve it, so
  the product shows the letter-code fallback. `sb-reference` does ship the flags, but the compare harness's
  `http-serve.mjs` has no `.svg` MIME type, so the reference side falls back too. The preview matches what Claude
  Design shows; the real Storybook shows flags (LocaleCurrencySwitcher open, SiteHeader desktop).
- Overlays (Dialog etc.) render their closed trigger in both Storybook and the preview.
- [GENERAL] The compare sheet scales each column to its widest shot, so small or content-sized components look
  tiny next to Storybook. Crop the raw `__ds.png` to content and view 1:1 next to `__sb.png` before judging size.
- [GENERAL] `/assets/...` images (flags, `/assets/storybook/placeholder-portrait.svg`) are app-served: both sides
  show the fallback (initials, country code). Faithful match (CountryFlag, Avatar, AvatarStack).
- [GENERAL] [ASSETS_BLOCKED]: stories load remote images from `a.storyblok.com` and `placehold.co`. The cloud
  environment's network policy must allow both hosts (Allowed domains), or those images break on both panels and
  Card "With Content" / PartnershipBadge "Default" can't be graded.
- `DropdownMenu` "With Submenu" is skipped (`cfg.overrides.DropdownMenu.skip`): the story builds its submenu from
  raw `@radix-ui/react-dropdown-menu` primitives, which the DS doesn't export. The preview bundled a second Radix
  copy, and opening the menu threw "`MenuSub` must be used within `Menu`". The design agent has no submenu API.
- Compare only captures closed overlays; interaction bugs (like the submenu crash) need a manual Playwright check.
- `Select` "Many Options" (defaultOpen): compare crops the reference shot to the story root, clipping the open
  list on the Storybook side only. Verified against a full-viewport Storybook screenshot: match.
- `DataTableTextCell` "All Cells" is ~1000px tall; the 900x700 capture cuts the tail. Tail rows were verified with a
  full-page shot. A taller `viewport` override would capture it (needs a full rebuild and re-grade).
- `InfoTooltip` `[RENDER_THIN]` is legitimate: the story itself is a lone 16px help icon with the tooltip closed.
- [GENERAL] A story whose FIRST root child is hidden at 900px (`hidden lg:block`) gets a false `sb-error`: compare
  waits for that child to become visible. Fix with a `viewport` override (PortalNavbar: `1280x800`).
- SiteHeader renders its mobile header at the 900px capture (below `lg`); desktop at 1280x800 was checked by hand.
- SiteMenuMobile `[RENDER_THIN]` is legitimate: the story is a closed menu, only the hamburger paints. Opened at
  390x844 it matches. Optional: `viewport: "390x844"` to mirror the story's `mobile1` default.
- Preview template quirk: card html pads `body` 24px; opening a modal Radix overlay (DropdownMenu-based menus)
  makes react-remove-scroll zero that padding, so the story jumps 24px when a menu opens in the product card, and
  a mouse click can land on the first item (PortalUserMenu/PortalProgramMenu "Bar"). Converter template issue,
  not a component defect; closed-state captures are unaffected.
- Fullscreen stories with a hoverable element at (0,0) show hover color in Storybook only (capture pointer rests
  there) - Breadcrumb "Home".
- PersonCard "Sizes": Storybook clips the third card (meta `w-72` decorator); MediaHero's donation card falls below
  the 700px capture. Framing.
- Carousel "Cards" has no width limit: Storybook grows to show all 5 cards, the 900px preview scrolls. Framing.

## Known render warns

- `[RENDER_THIN]` InfoTooltip, SiteMenuMobile - see grading notes (triaged, not defects).
