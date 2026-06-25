# Social Income

#### #Tech4Good &nbsp;&nbsp;#OpenSource &nbsp;&nbsp;#Solidarity

![Social Income Logo](https://github.com/socialincome-san/public/assets/6095849/e33d03b3-7502-46cc-bfe8-f70ff4374a0e)

Social Income is a radically simple solution in the fight against poverty.
The open-source initiative converts donations into an unconditional basic
income, sent directly to the mobile phones of people living in poverty in the
Global South.

https://user-images.githubusercontent.com/6095849/191377786-10cdb4a1-5b25-4512-ade9-2cc0e153d947.mp4

## What Is In This Repository?

This repository contains the public website, internal tools, local development
seed data, infrastructure code, and the recipient mobile app.

```text
/
├─ recipients_app/        Mobile app for Social Income recipients
├─ seed/                  Firebase emulator seed data
└─ website/               Next.js app, APIs, database, infra, and tests
```

### `website/`

The main Next.js application. It contains:

- Public website: the public Social Income website. Parts are still hardcoded,
  while more content is being moved to Storyblok CMS.
- Portal: internal operations tool for program management, payments,
  recipients, contributors, and admin functionality.
- Dashboard: contributor self-service area for payments, subscriptions, and
  personal details.
- Partner Space: local partner self-service area for recipients, candidates,
  and partner profile data.
- API routes: backend endpoints used by the website and the recipient mobile
  app.
- Database layer: Prisma ORM with PostgreSQL.
- Infrastructure: Terraform configuration under `website/infra`.
- Tests: unit tests and Playwright end-to-end tests.

### `recipients_app/`

Mobile app for recipients. Recipients can log in, view payment history, and
complete surveys. See `recipients_app/README.md` for mobile setup details.

### `seed/`

Seed data for the local Firebase emulators. Firebase Auth users are imported
automatically when the local development environment starts.

## Local Development Setup

### Requirements

Install these tools before starting:

- [mise](https://mise.jdx.dev)
- Docker
- Node.js and npm through mise

On macOS, install mise with:

```bash
brew install mise
```

### 1. Install Tool Versions And Dependencies

```bash
cd website
mise install
npm ci
```

The web app keeps its Node dependencies, mise tasks, formatting config, Prisma
setup, and most local tooling inside `website/`.

### 2. Prepare Environment Variables

Copy the local env template:

```bash
cd website
cp .env.local.sample .env.local
```

For most external contributors, the only required CMS value is:

```bash
STORYBLOK_PREVIEW_TOKEN="<public-content-delivery-api-token>"
```

Despite the name, `STORYBLOK_PREVIEW_TOKEN` is used by the website to load
Storyblok content through the Content Delivery API. A public token is enough
for frontend and UI work against published content.

If you need this token, ask a maintainer or contact
`support@socialincome.org`. Do not commit real API keys or secrets.

Maintainers may also need these Storyblok values for preview mode, webhooks,
or schema/type generation:

- `STORYBLOK_PREVIEW_SECRET`
- `STORYBLOK_WEBHOOK_SECRET`
- `STORYBLOK_PERSONAL_ACCESS_TOKEN`
- `STORYBLOK_SPACE_ID`

### 3. Start The Local Environment

```bash
cd website
mise dev
```

This starts:

- PostgreSQL in Docker
- Firebase emulators for Auth and Firestore
- Next.js at `http://localhost:3000`

The Firebase emulator UI is available at:

```text
http://localhost:4000
```

Auth users can be inspected at:

```text
http://localhost:4000/auth
```

### 4. Seed The Local Database

Firebase Auth users are imported automatically from `seed/auth_export` when
the emulator starts. The PostgreSQL database needs to be seeded once manually:

```bash
cd website
npm run db:seed
```

This fills the local database with representative test data from
`website/src/lib/database/seed`.

## Local Login

Open the website at:

```text
http://localhost:3000
```

Click `Login` in the top navigation and enter one of these local test users:

| Area | Purpose | Email |
| --- | --- | --- |
| Portal | Internal operations and admin tool | `power@portal.test` |
| Dashboard | Contributor self-service area | `coreh@dashboard.test` |
| Partner Space | Local partner self-service area | `sl@partner.test` |

In staging and production, login sends a magic link by email. Locally, the
Firebase emulator logs the magic link instead. Copy it from the terminal
running `mise dev`, or open:

```text
http://localhost:4000/logs
```

## Development Flow

The main integration branch for active development is `develop`.

1. Create your feature branch from `develop`.
2. Keep your changes focused on one issue or feature.
3. Run the relevant checks locally.
4. Open a pull request back into `develop`.
5. Wait for CI and review.

Example:

```bash
git checkout develop
git pull
git checkout -b fix/issue-2064-short-description
```

Website checks run for pull requests and for pushes to `develop` and `main`.
Staging deployment is connected to `develop`; production releases are handled
by maintainers.

Useful local checks for website changes:

```bash
cd website
npm run lint
npm run typecheck
npm run test:unit
npm run test:e2e
```

For many small UI or content changes, `lint` and `typecheck` are a good
minimum before opening a PR. Run the broader test suite when touching shared
logic, authentication, database behavior, or user flows.

## Storyblok Development

We use [Storyblok](https://www.storyblok.com/docs) as CMS for parts of the
public website.

For normal local development, set the public Content Delivery API token in
`website/.env.local`:

```bash
STORYBLOK_PREVIEW_TOKEN="<public-content-delivery-api-token>"
```

Use local HTTPS if you are working with Storyblok live preview:

```bash
cd website
mise run dev-ssl
```

### Storyblok Type Generation

If you changed the Storyblok schema, regenerate the generated TypeScript
types. This requires maintainer-level Storyblok credentials:

```bash
cd website
npm run storyblok:generate
```

The command logs into Storyblok, pulls component schemas, and writes generated
types to `website/src/generated/storyblok/types`.

## Mobile API

The `recipients_app` communicates with the Next.js API routes. The public API
documentation is available at:

https://socialincome.org/v1/api-docs

## Troubleshooting

### Translations Or Generated Content Look Stale

```bash
rm -rf website/.next
cd website
mise dev
```

### Firebase Seed Data Did Not Update

The Firebase emulators load seed data from `seed/`. If you changed the seed
data and want a fresh start:

```bash
docker compose -f website/docker-compose.yml down --remove-orphans --volumes
cd website
mise dev
```

### Docker Or Database State Looks Broken

If Prisma migrations fail, old containers are hanging around, or the local DB
is in a strange state, reset the website Docker environment:

```bash
docker compose -f website/docker-compose.yml down --remove-orphans --volumes
```

This removes the website Docker containers and named volumes, including local
PostgreSQL data. Run `mise dev` and `npm run db:seed` again afterwards.

### E2E Checks Look Stuck

The Playwright CI job may update screenshots and commit them back into a PR.
That creates a new commit. GitHub sometimes does not start a fresh workflow
run for commits made by `github-actions`, so checks can appear stale even
though the previous run passed. Ask a maintainer if this happens.

## Useful Commands

### Database

```bash
cd website
npm run db:seed
npm run db:studio
npm run db:migrate:dev
```

### Dump Local Database

```bash
pg_dump -Fc --no-owner "postgresql://social-income:social-income@localhost:5432/social-income" > local.dump
```

### Restore A Dump

```bash
pg_restore --clean --if-exists --no-owner -d "<database-url>" local.dump
```

## Financial Contributions

### Donate 1 Percent Of Your Income

[Become a contributor](https://socialincome.org/get-involved) of Social
Income. Donations are tax-deductible in Switzerland.

### Sponsor Dev Community

[Become a sponsor](https://github.com/sponsors/socialincome-san) and help
build open-source software for more equality and less poverty. Donations
through the GitHub Sponsor program support the developer community.

## Social Income NGO

### Non-Profit Organization

Social Income is a non-profit association
([CHE-289.611.695](https://www.uid.admin.ch/Detail.aspx?uid_id=CHE-289.611.695))
based in Zurich, Switzerland. Connect with us on
[X](https://twitter.com/so_income),
[Instagram](https://instagram.com/so_income),
[LinkedIn](https://www.linkedin.com/company/socialincome),
[Facebook](https://facebook.com/socialincome.org), or by
[email](mailto:hello@socialincome.org).

### Radical Transparency

We believe that transparency builds trust and trust builds solidarity. This is
why we disclose our
[finances](https://socialincome.org/transparency/finances/usd) to the public.

### Open Source Community

Open source is made by people like you. These individuals, among many others,
have contributed to Social Income:

[![Contributors](https://contrib.rocks/image?repo=socialincome-san/public&columns=10)](https://github.com/socialincome-san/public/graphs/contributors)

### Software And IP Contributions

We receive in-kind donations from
[Google Nonprofit](https://www.google.com/nonprofits/),
[GitHub](https://socialimpact.github.com),
[Codemagic](https://codemagic.io/start/),
[Linktree](https://linktr.ee),
[Twilio](https://twilio.org),
[Algolia](https://www.algolia.com),
[JetBrains](https://www.jetbrains.com),
[Storyblok](https://www.storyblok.com),
[1Password](https://1password.com),
[Mux](https://www.mux.com),
[Sentry](https://sentry.io), and
[Lineto](https://www.lineto.com). Our tools also use open-source technologies
such as [FireCMS](https://firecms.co),
[Storybook](https://storybook.js.org), and
[Tailwind CSS](https://tailwindcss.com).

## License

This project is licensed under [MIT](LICENSE), with the exception of the
[Unica77 font](https://lineto.com/typefaces/unica77), which is exclusively
licensed to Social Income.
