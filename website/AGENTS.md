# Website

Next.js app: public site (`src/app/[lang]/[region]`), portal, dashboard,
partner space, API routes (`src/app/api`) and backend.

- `src/app`: routes, pages, route handlers
- `src/components`: composition of design-system components with data
- `src/modules/<domain>`: business logic
- `src/integrations/<vendor>`: external APIs and provider SDKs
- `src/lib`: shared kernel (Result, i18n, utils, Prisma client)
- `src/server`: request helpers (`requireSession`, scheduler auth)
- `src/generated`: Prisma and Storyblok output, never edit

Rules live in `eslint.config.mjs` and
`eslint-rules/backend-architecture.mjs`. Read them when an error is
unclear.

## Backend

Why: each domain stays in one folder with fixed file roles, so changes
stay local and reviewers know where validation, authorization and
queries are. Vendors (Stripe, Twilio, SendGrid, Firebase Admin) are
reachable only through `src/integrations`, so their SDKs, secrets and
error shapes stay in one place. `src/lib` only holds code that still
makes sense after deleting any product area; it imports no modules, app,
components or `src/server`.

Module files (`src/modules/recipients` is the reference):

- `*.actions.ts`: trust boundary for client calls. `'use server'`, async
  exports named `…Action`, params typed `unknown` or `FormData`. Resolve
  session, parse with Zod, call the service, then `revalidatePath` or
  `redirect`.
- `*.service.ts`: use case, business rules and authorization. Never
  throws, never uses `next/cache` or `next/navigation`.
- `*.repository.ts`: the only Prisma access. Exports start with
  `find|create|update|delete|remove|count|group`, use `select` (never
  `include`), return raw data.
- `*.permissions.ts`: pure predicates `can…|has…|is…|assert…`.
- `*.schemas.ts`: Zod schemas named `…Schema` and their inferred types.
- `*.types.ts`: serializable DTOs and inert constants, no functions.
- `*.test.ts`: Jest, next to the tested file.

Integrations: `src/integrations/<vendor>/<name>.integration.ts`. No
Prisma, modules, app, components or `next/*` APIs.

Dependency direction:

- app → services, actions, `src/server`
- components → actions, `*.types`, type-only `*.schemas`
- actions → services
- services → own repository and permissions, other modules' services,
  integrations
- Across modules: only `*.service`, or type-only `*.types`/`*.schemas`

Services, actions and async integration exports return `Result<T>` from
`src/lib/result.ts`: `resultOk(data)` or `resultFail('Fixed message.')`.
Never put `error.message` or interpolated text in `resultFail`; log
details with `console.error`. Clients unwrap with `handleResult`
(`src/lib/result-client.ts`). Route handlers return generic JSON errors
and call `sendSlackAlert` for production failures that must not stay
silent.

In modules and integrations: arrow functions, named exports, no classes,
no `as` (except `as const`), no `!`. All paths under `src` are
kebab-case.

Lint cannot check these, so verify them yourself:

- authorization happens in the service, not only in the UI;
- every untrusted field is validated on the server;
- business rules stay in the service;
- DTOs sent to the client contain only what it may see.

Prisma schema: `src/lib/database/schema.prisma`. Create migrations with
`npm run db:migrate:create`. They must stay backwards compatible,
because the previous deployment runs against the migrated schema.

## Frontend

UI comes from the design system. Read `design-system/AGENTS.md` first.

1. Use an existing design-system component.
2. If it almost fits, add a variant or prop there.
3. Otherwise create a generic component with a story there, then use it.

The website side is composition and data:

- Pages are server components: `requireSession` from `src/server`, call
  services, pass plain data down.
- `src/components` maps data to design-system props. Storyblok blocks
  turn CMS content into props, flows such as wizards hold state and call
  actions, text is translated here.
- Allowed here: layout glue (flex, grid, gap, spacing) and thin type
  adapters such as `src/components/country-flag.tsx`.
- Not allowed here: new visual elements (cards, panels, heroes, step
  indicators) built from raw markup. Older components still do this;
  don't copy them, and move their visuals to the design system when you
  touch them.
- Never pass a Storyblok story, blok or Prisma type to a design-system
  component.

The same lint rules as in the design system apply: no `className` or
`style` props, tokens only for colors, font sizes, radii and shadows.

Text: translations live in
`src/lib/i18n/locales/<lang>/<namespace>.json` and use ICU MessageFormat
(`{name}`, `{count, plural, one {…} other {…}}`). Translate with
next-intl: `getTranslations('namespace')` in server components,
`useTranslations('namespace')` in client components. The locale comes
from `next/root-params`, which throws in route handlers and server
actions, so pass it there (`getTranslations({ locale, namespace })`) and
use `createTranslator` with `loadMessages` in services. Pass values to
`t()` instead of replacing placeholders, use `t.rich` for markup, and
add new keys to every language that has the namespace.

## Commands

- `mise dev`: Postgres, Firebase emulators, Next.js on :3000
- `npm run lint` (architecture rule tests, then ESLint), `typecheck`,
  `test:unit`, `format:check`, `check:unused`
- `npm run test:e2e`: Playwright, needs the local environment
- `npm run db:seed`, `db:migrate:create`, `db:studio`,
  `storyblok:generate` (maintainer credentials)

Local test users are in the README; while the emulators run they are at
http://localhost:4000/auth.
