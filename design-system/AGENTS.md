# Design system

Shared React components for Social Income Next.js apps
(`@socialincome/design-system`). This package does not import the
website, Storyblok, or Prisma. The website imports this package.

Run commands from this directory. Dependencies are installed from the
repository root (`npm ci --prefix ..`).

`npm run storybook` starts Storybook at http://localhost:6006.
`npm run build-storybook` writes the static site to `storybook-static`,
which is what Vercel deploys. `npm run lint`, `npm run typecheck`, and
`npm run test:unit` stay in this package.

Styles live in `src/styles.css`. Components use `next/link` and
`next/image`. Fonts are bundled from `public/fonts` by the relative URLs
in `src/styles/fonts.css`. `CountryFlag` loads
`/assets/flags/<country>.svg` from this package's `public/assets/flags`
in Storybook, and from `website/public/assets/flags` in the website.
Keep those copies in sync. Do not point Storybook at the website.

Components own their styling and never accept `className` (or
`*ClassName`) props. Expose named props instead (`variant`, `size`,
`fullWidth`, ...) and map them to classes with CVA. Wrap third-party or
HTML prop types in `WithoutClassName` from `src/without-class-name.ts`.
Layout around a component (margins, width, grid placement) belongs to
the parent or a wrapping element. `eslint-rules/no-class-name-prop.mjs`
enforces this in both packages.

Components live in purpose groups under
`src/components/<group>/<name>/`: `actions`, `forms`, `overlays`,
`navigation`, `feedback`, `data-display`, `layout`, `brand`, `icons`.
Import them by path, for example
`@socialincome/design-system/forms/input/input`; there are no barrel
files. Storybook titles mirror the folders (`Forms/Input`), and the
sidebar order is set in `.storybook/preview.ts`.

Foundations (colors, typography, spacing and layout, radius, shadows,
motion) are documented in `src/foundations/*.stories.tsx`. Those stories
read the resolved CSS values at runtime, so update them when you add or
rename a token in `src/styles/`.

Design values come from tokens only. `src/styles/theme.css` removes
Tailwind's default palette (`--color-*: initial`), so classes like
`text-slate-600` generate nothing; `white` and `black` stay for content
on media. `eslint-rules/no-arbitrary-design-values.mjs` rejects palette
colors and arbitrary colors, font sizes (px/rem), radii and shadows in
both packages. If a value is missing, add a token to `src/styles/` and
document it in the matching foundations story.
