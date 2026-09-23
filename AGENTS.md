<!-- BEGIN:smartive-agent-rules -->

> Managed by @smartive-private/ai-playbook v1.9.0.

# Philosophy

Write code that stays maintainable under repeated change. Prefer small,
verifiable improvements over clever shortcuts. Fight entropy. Leave the
codebase better than you found it.

## General Rules

- Ask questions until you have enough context to give an accurate and
  confident answer
- Only make changes that are directly requested. Keep solutions simple
  and focused.
- Prefer clear function/variable names over inline comments
- Prefer simple inline expressions over extracting single-use helper
  functions
- Always read and understand relevant files before proposing edits. Do
  not speculate about code you have not inspected.

# React Rules

- Customize behavior through composition; reserve boolean props for
  clear semantics (for example `disabled`).
- Split massive JSX blocks into understandable and composable smaller
  components
- Colocate code and state that changes together
- Keep state minimal; derive values when possible.
- Consolidate related state transitions with `useReducer` when multiple
  state updates belong together
- Use `useEffect` only for external synchronization; if unsure, check
  `.ai-playbook/react-use-effect.md`

# Web App Rules

- When creating web UIs, follow Web Interface Guidelines in
  `.ai-playbook/web-interface-guidelines.md`
- When creating web animations, follow Web Animation Design in
  `.ai-playbook/web-animation-design.md`

# TypeScript Rules

- NEVER use any, as any, or @ts-ignore. If types are complex, take the
  time to define them properly or ask for clarification.
- Prefer arrow functions over function declarations
- Prefer destructuring over assigning to a variable
- Prefer template literals over string concatenation
- Prefer types over interfaces
- Prefer type guards over type assertions
- Prefer importing types using the type keyword (e.g.
  `import { type MyType } from 'package';`), to ensure they are erased
  at runtime

# Terraform Rules

- Keep plans deterministic; pin provider versions and avoid implicit
  behavior.
- Treat `terraform plan` output as a required review artifact.
- Prefer modules and variables over duplicated infrastructure blocks.
- Protect state and credentials; never store secrets in plaintext.

<!-- END:smartive-agent-rules -->

# Backend Architecture

This project is migrating toward a Next.js modular monolith. The
`src/modules/recipients` module is the reference implementation.

```text
app -> modules
modules -> repositories + integrations
repositories -> Prisma
integrations -> external APIs
```

Legacy domains may not follow this structure yet. Apply it when
migrating one domain at a time; do not broaden a focused change into an
unrelated migration.

## Module file roles

| Suffix             | Responsibility                                                  |
| ------------------ | --------------------------------------------------------------- |
| `*.actions.ts`     | Auth, Zod parse of `unknown`, service call, revalidate/redirect |
| `*.service.ts`     | Use cases, authorization, business validation, orchestration    |
| `*.repository.ts`  | Exclusive Prisma access for the domain                          |
| `*.schemas.ts`     | Zod boundary schemas and inferred input types                   |
| `*.permissions.ts` | Pure authorization predicates                                   |
| `*.types.ts`       | Shared DTOs and view models                                     |
| `*.integration.ts` | External API wrappers under `src/integrations/`                 |

## Functions

- Use arrow functions assigned to `const`; never add function
  declarations.
- Do not introduce service or repository classes.
- Prefer named exports and explicit imports.
- Put exported functions first and private helpers below.
- Export only what another file needs.

## Server Actions

- Authenticate the caller and validate all untrusted input.
- Call a module service, then revalidate or redirect as needed.
- Do not access Prisma or integrations directly.
- Do not contain business or authorization rules.
- Every runtime export must be an async function named `*Action`.
- Action files must start with `'use server'`.
- Exported action parameters must be typed as `unknown` or `FormData`.

## Services

- Own use-case logic, authorization, business validation, and
  orchestration.
- May call repositories and integrations.
- Must not import Prisma directly.
- Every exported function must declare `ServiceResult<T>` or
  `Promise<ServiceResult<T>>`.
- `resultFail` messages must be stable and client-safe. Log raw errors
  server-side; never pass `JSON.stringify(error)` to `resultFail`.
- Do not throw for expected business failures; return `resultFail`.

## Repositories

- Are the exclusive database access layer for their domain.
- May import Prisma and should expose meaningful persistence operations.
- Must not call external integrations, services, actions, or
  permissions.
- Do not create generic or base repositories.
- Return raw persistence data; do not wrap repository results in
  `ServiceResult`.
- Exported functions use persistence verbs: `find*`, `create*`,
  `update*`, `delete*`, `remove*`, `count*`, or `group*`.
- Use explicit Prisma `select`; never `include`.

## Integrations

- Wrap external APIs only.
- Must not access Prisma or import business modules.
- Dependency direction is `modules -> integrations`, never the reverse.
- Async exported operations return `Promise<ServiceResult<T>>`.
- Pure synchronous mappers may return raw values.

## Validation

- Zod schemas validate untrusted boundary input on the server.
- Client validation is for UX only.
- Always validate on the server.
- Business validation belongs in services.
- Uniqueness, foreign keys, and other database invariants remain
  database constraints where appropriate.
- Exported schema values are named `*Schema`.

## Permissions

- Keep authorization predicates pure and free of I/O.
- Exported permission functions are named `can*`, `has*`, `is*`, or
  `assert*`.

## Types

- Keep single-file types local.
- Put shared module contracts and inert constants in `*.types.ts`.
- Do not export runtime functions, parsers, validators, or business calculations from `*.types.ts`.
- Keep Zod-inferred input types next to their schemas.
- Return explicit serializable DTOs across server/client boundaries; do
  not expose broad Prisma models.

## Import boundaries

- Actions must not import repositories, permissions, integrations,
  Prisma, app, or components.
- Services must not import Prisma, Next.js cache/navigation APIs, app,
  components, or actions.
- Repositories must not import services, actions, permissions,
  integrations, app, components, auth providers, or provider SDKs.
- Schemas, permissions, and types must not import services,
  repositories, actions, or integrations.
- Components may import module actions and type-only DTO/schema
  contracts; never services, repositories, permissions, or runtime
  schemas.
- App routes and pages may call module services/actions, but not
  repositories, permissions, or integrations.
- Cross-module callers use the owning module service, not another
  module's repository or permissions.
- Modules must not import provider SDKs directly (`firebase-admin`,
  `twilio`, `stripe`, `@sendgrid/*`); use integrations.

## Type safety in modules and integrations

- No `any`, `@ts-ignore`, `@ts-expect-error`, or `@ts-nocheck`.
- No non-null assertions (`!`).
- No type assertions except `as const`.
- Prefer type guards and explicit typing.
- No `console.log`. Use `console.warn`, `console.info`, or
  `console.error` when logging is needed.

## ESLint enforcement

Architecture rules for modules and integrations live in
`website/eslint.config.mjs` and
`website/eslint-rules/backend-architecture.mjs`.

Additional enforced contracts:

- Filename suffix allowlist for modules and integrations
- No cross-module deep imports (use the owning module service)
- Provider SDKs only inside `src/integrations/**`
- Action params typed as `unknown` / `FormData`
- No Prisma `include` in repositories
- No service throws for expected failures
- `no-console` allowing only `warn`, `info`, and `error`

Run:

```bash
npm run lint:architecture
npm run lint
```

`npm run lint` runs the architecture rule tests first.

## What lint cannot prove

These still require review and tests:

- Authorization correctness for a specific actor
- Complete Zod coverage of every untrusted field
- DTO serializability across the network boundary
- Correct placement of business rules vs persistence details
- Transaction boundaries and distributed compensation

Deferred on purpose (too brittle for AST lint today):

- Action body allowlists beyond import restrictions
- Mandatory `$transaction` usage
- Forbidding double parsing at action and service layers
- Service file-size limits
- Shared structured logger (use `console.warn`/`info`/`error` for now)

## Abstractions

Avoid generic repositories, unnecessary interfaces, dependency injection
containers, abstract classes, and factories without concrete value. Keep
module dependencies explicit and boring.
