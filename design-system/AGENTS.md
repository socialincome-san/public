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
`next/image`.
