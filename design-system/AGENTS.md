# Design System

`@socialincome/design-system`: the reusable UI for Social Income Next.js
apps. Every visual building block belongs here; the website only
composes and feeds data.

## Boundary

Components are generic:

- Everything comes in through props: data as plain values, all
  user-facing text (including `aria-label`s) as strings or `ReactNode`,
  behavior as callbacks.
- No data fetching, server actions, sessions, cookies or translations.
- Generic prop names (`title`, `items`, `status`), never CMS or database
  shapes (`story`, `blok`, `recipient`).
- No imports from the website (`@/…`), from outside this package, or of
  packages missing from this `package.json` (`no-package-escape` lint
  rule).

Before adding a component, search `src/components`. If something is
close, add a variant or prop instead of a sibling.

## Components

Reference: `src/components/actions/button/button.tsx`.

- `src/components/<group>/<name>/<name>.tsx`, kebab-case. Groups:
  `actions`, `forms`, `overlays`, `navigation`, `feedback`,
  `data-display`, `layout`, `brand`, `icons`.
- Every component has `<name>.stories.tsx` with `tags: ['autodocs']`, a
  `docs.description.component` and one story per variant or state. Title
  mirrors the folder (`Data Display/Stat`); new groups go into the
  sidebar order in `.storybook/preview.ts`.
- Imported by path (`@socialincome/design-system/forms/input/input`), no
  barrel files. Files other than `<name>.tsx` need an entry in the
  `package.json` `exports`.
- Radix for interactive behavior, CVA for variants, `cn` from
  `src/cn.ts`, `forwardRef` where a ref makes sense, `'use client'` only
  when needed. `next/link`, `next/image`, `lucide-react` icons.
- Accessible by default: semantic elements, labels for controls and
  icon-only buttons, visible `focus-visible` styles, keyboard support,
  respect `prefers-reduced-motion`.
- Jest tests (`*.test.tsx`) only for real logic; stories cover visual
  states.

### No `className` or `style`

Components own their styling and never accept `className`, `*ClassName`
or `style`. Expose named props (`variant`, `size`, `fullWidth`, …) and
map them with CVA. Wrap spread HTML or third-party prop types in
`WithoutClassName<…>` (`src/without-class-name.ts`). Margins, width and
grid placement belong to the parent. Lint enforces this here and in the
website.

## Design Tokens

Colors, font sizes, radii and shadows come only from tokens, documented
in Storybook › Foundations (`src/foundations/*.stories.tsx`).

- Colors: Tailwind's palette is removed (`--color-*: initial`). Use the
  semantic tokens in `src/styles/theme.css` (`foreground`,
  `muted-foreground`, `primary`, `destructive`, `confirm`, `warning`,
  `border`, …). `white`/`black` only for content on media.
- Font sizes: Tailwind's scale plus `text-2xs`, `text-display`,
  `text-display-lg`.
- Radii and shadows: Tailwind's scales plus `rounded-5xl`,
  `rounded-control`, `shadow-card`, `shadow-raised`, `shadow-overlay`,
  `shadow-dock`, `shadow-backstage`, `drop-shadow-card`,
  `drop-shadow-on-media`.

`no-arbitrary-design-values` rejects palette colors (`bg-red-500`) and
arbitrary colors, px/rem font sizes, radii and shadows (`text-[13px]`,
`rounded-[6px]`). Allowed: values built from tokens
(`from-[hsl(var(--gradient-button-from))]`), relative sizes
(`text-[0.45em]`), arbitrary spacing and aspect ratios. Prefer
`max-w-content` and `w-site-width` for page width.

Add a token only when none fits and the value is part of the visual
language:

1. Raw value in `src/styles/tokens.css`.
2. Tailwind name in the `@theme` block of `src/styles/theme.css`.
3. New font-size, radius or shadow names also in `extendTailwindMerge`
   in `src/cn.ts`, or `cn` drops them.
4. Update the matching foundations story.

## Notes

- `src/styles.css` is the stylesheet the website imports. Fonts come
  from `public/fonts`.
- Flags exist in `public/assets/flags` here (Storybook) and in
  `website/public/assets/flags`. Keep both in sync; never point
  Storybook at the website.
- `npm run storybook` serves http://localhost:6006. CI also runs
  `npm run build-storybook`. After changing a component, run `lint` and
  `typecheck` in `website/` too.
