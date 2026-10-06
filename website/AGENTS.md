# Website

Next.js modular monolith. Business code lives in `src/modules`. External
APIs live in `src/integrations`. `src/modules/recipients` is a
representative module. Prisma schema: `src/lib/database/schema.prisma`.

Success and failure cross these boundaries as `Result<T>` from
`src/lib/result.ts` (`resultOk`, `resultFail`). Client code uses
`handleResult` from `src/lib/result-client.ts`.

```text
app / feature components -> module services and actions, plus request helpers in src/server
feature components -> design-system
design-system -> React, Radix, Tailwind, and cn. No modules, CMS, generated types, or app code
modules -> repositories and integrations
repositories -> Prisma (src/lib/database), raw data, no Result
integrations -> external APIs
everyone -> lib, and only for code that still makes sense after deleting one product area
```

`redirect` and `notFound` live in `src/server`. Session resolution lives
in `modules/auth/session.service.ts`. Shared config used by both a
module and an integration stays in `lib`.

Suffixes: `*.actions.ts` authenticates, parses `unknown` with Zod, calls
the service, then revalidates or redirects. `*.service.ts` owns the use
case and authorization. `*.repository.ts` is the only Prisma access.
`*.schemas.ts`, `*.permissions.ts`, and `*.types.ts` hold boundary
schemas, pure auth predicates, and serializable DTOs.

ESLint is the contract for imports, filenames, Result types, and syntax.
Read `eslint.config.mjs` when an error is unclear.

Lint does not prove that the caller is allowed to do this, that every
untrusted field is validated on the server, that business rules stayed
in the service, or that the DTO is safe to send to the client.

Design system primitives live in `design-system` and are imported as
`@socialincome/design-system`. Follow
`design-system/src/components/actions/button/button.tsx`: `forwardRef`,
CVA, Radix, and Tailwind, with classes merged through `cn` from
`design-system/src/cn.ts`. That package does not import the website.
Components, in both packages, do not accept `className` props: pick a
variant or add one to the component, and handle layout in the parent.
Colors, font sizes, radii and shadows come from design-system tokens
(Storybook › Foundations); Tailwind's default palette and arbitrary
values for these are rejected by lint. Feature screens, wizards, data
tables, and CMS blocks stay in `src/components` and may call module
actions. `src/app/globals.css` imports
`@socialincome/design-system/styles.css` and adds `@source` for
`design-system/src`, so Tailwind still scans the package when that CSS
is resolved through `node_modules`.

Local auth users come from the Firebase emulator seed. While the
emulators are running, the list is at http://localhost:4000/auth.
