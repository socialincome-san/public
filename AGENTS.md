# Social Income

Open-source platform for unconditional basic income. Read the
`AGENTS.md` next to the code you change.

- `design-system/`: generic React components, design tokens, Storybook
- `website/`: Next.js app (public site, portal, dashboard, partner
  space, API) and its backend
- `recipients_app/`: Flutter app, own rules
- `seed/`: Firebase emulator seed data

## Architecture

- Every visual building block lives in `design-system/`: generic, styled
  only with tokens, unaware of Storyblok, Prisma, actions, i18n or the
  website. `website/` composes these components and feeds them data.
  Need something that looks new? Build or extend it in the design
  system.
- The website backend is a modular monolith: `src/modules` (business
  logic), `src/integrations` (external APIs), `src/lib` (domain-free
  kernel). Expected failures are returned as `Result<T>`, not thrown.
- ESLint enforces most of this. Fix the code, never disable a rule.

## Working Rules

- Read the relevant code before editing. Reuse what exists before
  adding.
- Change only what the task needs. Keep it simple; no speculative
  abstractions or single-use helpers.
- Prefer clear names over comments.
- Never edit `website/src/generated/**` or applied Prisma migrations.

## TypeScript And React

- No `any`, `@ts-ignore` or `@ts-expect-error`. Prefer type guards over
  `as`.
- Arrow functions, named exports, `type` over `interface`,
  `import { type X }` for types.
- Compose with `children` and slot props; boolean props only for clear
  states such as `disabled`.
- Keep state minimal and derive the rest during render. Use `useReducer`
  when several updates belong together.
- `useEffect` only to sync with something outside React. Not for derived
  values, event responses or resetting state (use `key`).

## Commands

Install once from the root with `npm ci`. Run everything else inside the
workspace (`website/` or `design-system/`). Before finishing, run in
each workspace you changed: `npm run lint`, `npm run typecheck`,
`npm run test:unit`, `npm run format:check` (`format:fix` to fix) and
`npm run check:unused`. Setup and local login: `README.md`.
