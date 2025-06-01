#### &nbsp;&nbsp;#Tech4Good &nbsp;&nbsp;#OpenSource &nbsp;&nbsp;#Solidarity

![Social Income Logo](https://github.com/socialincome-san/public/assets/6095849/e33d03b3-7502-46cc-bfe8-f70ff4374a0e)

https://user-images.githubusercontent.com/6095849/191377786-10cdb4a1-5b25-4512-ade9-2cc0e153d947.mp4

## Social Income is a radically simple solution in the fight against poverty. The global open-source initiative converts donations into an unconditional basic income, which is sent directly to the mobile phones of people living in poverty in the Global South.

### ![SDG Icon](https://i.imgur.com/LHoR8Et.png) [SDG 1](https://sdgs.un.org/goals/goal1) &nbsp;&nbsp; ![SDG Icon](https://i.imgur.com/LHoR8Et.png) [SDG 10](https://sdgs.un.org/goals/goal10)

## OSS Tools by Social Income

|                  |                                                Admin Tool                                                 |                                                                                       Website                                                                                        |                                                                                  Mobile App                                                                                   |
| ---------------- | :-------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|                  |    ![](https://github.com/socialincome-san/public/assets/6095849/42a8ce3e-4ff3-4d25-a298-1b4bc1570b0a)    |                                         ![](https://github.com/socialincome-san/public/assets/6095849/e4dbf692-d4b9-4253-88ea-2da7970919d8)                                          |                                      ![](https://github.com/socialincome-san/public/assets/6095849/94d0f653-d894-4e9e-ab0d-b1cd8bfe9eab)                                      |
| **Purpose**      |                      Make it simple to manage payments, contributors and recipients                       |                                                                       Raising donations and inform the public                                                                        |                                                         Make it simple for recipients to manage payments and surveys                                                          |
| **Instructions** |                                         [Readme](admin/README.md)                                         |                                                                             [Readme](website/README.md)                                                                              |                                              [Readme](recipients_app/README.md) / [Contributing](recipients_app/CONTRIBUTING.md)                                              |
| **Localhost**    |                  [localhost:3000](http://localhost:3000) / [4000](http://localhost:4000)                  |                                                                       [localhost:3001](http://localhost:3001)                                                                        |                                                                                       –                                                                                       |
| **Staging**      |                 [staging-admin.socialincome.org](https://staging-admin.socialincome.org)                  |                                                            [staging.socialincome.org](https://staging.socialincome.org/)                                                             |                         [Testflight](https://developer.apple.com/testflight/) / [App Distribution](https://firebase.google.com/docs/app-distribution)                         |
| **Production**   |                         [admin.socialincome.org](https://admin.socialincome.org)                          |                                                                     [socialincome.org](https://socialincome.org)                                                                     | [iOS](https://apps.apple.com/ch/app/social-income/id6444860109?l=en-GB) / [Android](https://play.google.com/store/apps/details?id=org.socialincome.app&pcampaignid=web_share) |
| **Issues**       | [Open issues](https://github.com/socialincome-san/public/issues?q=is%3Aissue+is%3Aopen+label%3Aadmintool) |                                       [Open issues](https://github.com/socialincome-san/public/issues?q=is%3Aissue+is%3Aopen+label%3Awebsite)                                        |                                   [Open issues](https://github.com/socialincome-san/public/issues?q=is%3Aissue+is%3Aopen+label%3Amobileapp)                                   |
| **UI Library**   |                                                     –                                                     | [Storybook](http://design.socialincome.org/) / [Figma](<https://www.figma.com/design/qGO3YI21AWIjWEyMPGUczM/Social-Income-Main-(Web%2C-App)?node-id=1653-6882&t=7cJ3pA0DfVrVtrDA-1>) |                                                                                       –                                                                                       |

# Code Contributions

### Basic Steps to Contribute

1. Choose an issue and leave a comment that you'd like to work on it
   (upon we assign it to you) `↗`
   [All issues](https://github.com/socialincome-san/public/issues?q=is%3Aopen+is%3Aissue)
   `↗`
   [Help wanted](https://github.com/socialincome-san/public/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22)
   `↗`
   [Good first issues](https://github.com/socialincome-san/public/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22)

2. Setup the basic development environment `↓`
   [Setup](#basic-development-setup)
3. Clone the repo and work on it `↓` [Developing](#developing)
4. Create a PR and wait for it to be reviewed
5. If approved, the PR will be merged into the `main` branch, first on
   the staging and subsequently on production `↓`
   [Deployments](#deployments)

**Frontend developers:** You can also develop UI components with
[Tailwind CSS](https://tailwindcss.com) and
[shadcn/ui](https://ui.shadcn.com) independent of the website
([Readme](ui/README.md) / [Contributing](ui/CONTRIBUTING.md)). The
components are all collected in our
[Storybook](http://design.socialincome.org/) and
[Figma file](<https://www.figma.com/design/qGO3YI21AWIjWEyMPGUczM/Social-Income-Main-(Web%2C-App)?node-id=1653-6882&t=7cJ3pA0DfVrVtrDA-1>).

### Basic Development Setup

We are mainly leveraging the following tools:

- [Firestore](https://firebase.google.com/docs/firestore) for data
  management
- [Firebase Authentication](https://firebase.google.com/docs/auth) for
  user management
- [Firebase Hosting](https://firebase.google.com/docs/hosting) to serve
  static content, such as the admin app
- [Vercel](https://vercel.com) for website hosting
- [Firebase Functions](https://firebase.google.com/docs/functions) to
  run backend code in a serverless framework
- [Firebase Storage](https://firebase.google.com/docs/storage) to store
  documents and other files
- [Firebase Emulators](https://firebase.google.com/docs/emulator-suite)
  for the local dev environment

### Database Migration Plan: Firestore ➜ PostgreSQL

We are transitioning from **Firestore (NoSQL)** to **PostgreSQL** for improved relational modeling and data consistency. To support this, we’ve introduced **[Prisma](https://www.prisma.io)** as our type-safe ORM and database toolkit.

> 🐳 **Docker Required:** To run the local PostgreSQL database, make sure you have [Docker](https://www.docker.com/products/docker-desktop) installed and running.

You can edit the database schema in:  
`shared/src/database/schema.prisma`

After modifying the schema (e.g. to change tables or fields), run a migration command to create a new SQL migration file. These files are automatically executed in **staging and production** via `db:migrate:deploy`.

#### Prisma & DB Commands

```bash
npm run db:up               # Start local PostgreSQL via Docker
npm run db:down             # Stop and remove Docker container
npm run db:generate         # Generate Prisma client
npm run db:migrate:dev      # Create & apply new migration in dev
npm run db:migrate:create   # Create migration file only (no apply)
npm run db:migrate:deploy   # Apply migrations in production
npm run db:migrate:reset    # Reset DB (dev only)
npm run db:migrate:status   # Check migration status
npm run db:introspect       # Pull schema from existing DB
npm run db:seed             # Run DB seed script
npm run db:studio           # Open Prisma Studio (GUI)
``

Run all commands from the root. They delegate to @socialincome/shared.


> 🧱 **To create a migration**:  
> Run `npm run db:migrate:dev` to create and apply the migration.  
> Or use `npm run db:migrate:create` to **only generate the migration file** without applying it.

#### 1. Prerequisites

**Node.js:** `brew install node@18` (Homebrew). Make sure you are using
Node.js 18. Follow
[this](https://ralphjsmit.com/switch-between-nodejs-versions-homebrew)
guide to switch between different versions of Node.js if need be.

**java**: `brew install openjdk` (Homebrew). See also troubleshooting
below.

<details>
  <summary>Troubleshooting</summary>

#### Error Missing Java

````shell
➜  socialincome-public git:(main) npm run firebase:serve

> @socialincome/monorepo@1.0.0 firebase:serve
> firebase emulators:start --project social-income-staging --config firebase.json --import ./seed

⚠  emulators: You are not currently authenticated so some features may not work correctly. Please run firebase login to authenticate the CLI.
i  emulators: Shutting down emulators.

Error: Process `java -version` has exited with code 1. Please make sure Java is installed and on your system PATH.
-----Original stdout-----
-----Original stderr-----
The operation couldn’t be completed. Unable to locate a Java Runtime.
Please visit http://www.java.com for information on installing Java.```
````

Solution

```shell
$ brew install openjdk
$ sudo ln -sfn $HOMEBREW_PREFIX/opt/openjdk/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk.jdk
```

</details>

#### 2. Install the dependencies

```shell
npm install
```

#### 3. Start environment

Initiate development environments for specific tools as needed (see
[table above](#oss-tools-by-social-income)).

- Always start the Firebase emulator first with `npm run firebase:serve`
  — console dashboard is available at
  [localhost:4000](http://localhost:4000).
- To start the Admin Tool, run `npm run admin:serve` and open
  [localhost:3000](http://localhost:3000).
- To start the Website, run `npm run website:serve` and open
  [localhost:3001](http://localhost:3001).
- To start the Storybook, run `npm run ui:serve` and open
  [localhost:6006](http://localhost:6006). (currently broken)

The [package.json](package.json) file gives you a good overview of the
available commands.

<details>
  <summary>Troubleshooting</summary>

#### Port taken

```shell
Error: Could not start Firestore Emulator, port taken.
```

Solution (macOS): In most cases it is due to port 8080 or 8085, which
can be _killed_ with one command:

```shell
kill $(lsof -t -i:8080) $(lsof -t -i:8085)
```

</details>

### Developing

#### Developer Logins

No production credentials are needed for local development.

<details>
  <summary>Developer Login for Admin Tool</summary>

#### Localhost Admin Tool Login ([Link](http://localhost:3000/))

Choose "Sign in with Google" and select the listed "Admin
(admin@socialincome.org)" account.

#### Staging Admin Tool Login ([Link](https://staging-admin.socialincome.org))

Contact the dev team
([dev@socialincome.org](mailto:dev@socialincome.org)) which can assign
you access rights to login.

#### Production Admin Tool Login ([Link](http://admin.socialincome.org))

Only selected people from the SI team have access.

</details>

<details>
  <summary>Developer Login for Website (Donor Dashboard)</summary>

#### Localhost Website Login ([Link](http://localhost:3000/login))

1. Go to the [Login page](http://localhost:3000/login) and select
2. Sign in with username test@test.org and password test@test.org.

#### Staging Website Login ([Link](https://staging.socialincome.org/login))

To create a donor account in the staging environment, proceed through
the
[donation process](https://staging.socialincome.org/donate/one-time).
Utilize the [Stripe test card](https://stripe.com/docs/testing) (4242
4242 4242 4242) for making a test donation.

#### Production Website Login ([Link](https://socialincome.org/login))

Only actual donors have accounts and can log in. Consider making a
(symbolic) donation to create your own account.

</details>

#### Data Seed

An initial dataset is imported into the Firebase emulators at startup.
You have the flexibility to add, delete, or modify data directly through
your [Admin Tool](http://localhost:3000) or the
[Firestore Admin Interface](http://localhost:4000/firestore/data)
locally. After making any changes, you can export the updated data to
the seed folder using the command `npm run firebase:export`.

#### Storyblok Development

1. Read the storyblok [documentation](https://www.storyblok.com/docs).
2. Set the values `STORYBLOK_PREVIEW_TOKEN` and
   `STORYBLOK_PREVIEW_SECRET` to the
   [env.development](website/.env.local). You can find the
   `STORYBLOK_PREVIEW_TOKEN` at the
   [storyblok_token](https://app.storyblok.com/#/me/spaces/109655/settings?tab=api)
   and the `STORYBLOK_PREVIEW_SECRET` at the
   [VISUAL_EDITOR](https://app.storyblok.com/#/me/spaces/109655/settings?tab=editor)
   in the `preview-url`.
3. (optional-step) `npm run dev:ssl-proxy`, this is needed if you want
   to preview the changes on the storyblok live editor for the local
   environment.

#### Format Code

We are using [Prettier](https://prettier.io) to format the code:
`npm run format-code`.

#### Deployments

**Staging:** PRs merged into `main` are automatically deployed to
staging ([Admin Tool](https://staging-admin.socialincome.org) /
[Website](https://staging.socialincome.org/)) upon core developer
approval. Check [Github Actions](./.github/workflows) for details.
Experienced contributors can deploy directly
[without approval](mailto:dev@socialincome.org).

**Production:** Deployments are made by core developers via
[GitHub releases](https://github.com/socialincome-san/public/actions/workflows/production-deployment.yml).

<details>
<summary>Naming Convention</summary>

Use the format "release-YYYY-MM-DD" for naming releases (example:
`release-2021-02-27`). For multiple releases on the same day, append a
suffix such as ".2", ".3", and so forth, to distinguish them (example:
`release-2021-02-27.2`).

</details>

#### Backups

We have a
[function](https://console.cloud.google.com/logs/query;query=resource.type%3D%22cloud_function%22%20resource.labels.function_name%3D%22siWebFirestoreExport%22%20resource.labels.region%3D%22us-central1%22?project=social-income-prod&authuser=1&hl=en)
which triggers hourly backups of our production firestore database. The
exports are saved to the
[social-income-prod](https://console.cloud.google.com/storage/browser/social-income-prod;tab=objects?forceOnBucketsSortingFiltering=false&authuser=1&project=social-income-prod&prefix=&forceOnObjectsSortingFiltering=true)
bucket with a retention period of 30 days.

<details>
<summary>Restore Database</summary>

To restore the database you can
[import](https://console.cloud.google.com/firestore/import-export?authuser=1&project=social-income-prod)
the most recent folder directly from the
[social-income-prod](https://console.cloud.google.com/storage/browser/social-income-prod;tab=objects?forceOnBucketsSortingFiltering=false&authuser=1&project=social-income-prod&prefix=&forceOnObjectsSortingFiltering=true)
bucket.

</details>

#### Bugs & Feature Requests

You can report an issue or request a feature on our
[issue page](https://github.com/socialincome-san/public/issues/new/choose).
If you want to report a vulnareablity please refer to our
[security policy](https://github.com/socialincome-san/public/blob/main/SECURITY.md).

<details>
<summary>Troubleshooting Development</summary>

**Problem**: Added or amended translations do not appear in the
localhost preview.

**Solution**: Remove the `website/.next` folder, which is automatically
generated, then re-execute `npm run website:serve`.

</details>

# Financial Contributions

### Donate 1 Percent of Your Income

[Become a contributor](https://socialincome.org/get-involved) of Social
Income (tax-deductible in Switzerland).

### Sponsor Dev Community

[Become a sponsor](https://github.com/sponsors/socialincome-san) and
help ensure the development of open source software for more equality
and less poverty. Donations through the GitHub Sponsor program are used
for building a strong developer community.

# Social Income (NGO)

### Non-Profit Organization

Social Income is a non-profit association
([CHE-289.611.695](https://www.uid.admin.ch/Detail.aspx?uid_id=CHE-289.611.695))
based in Zurich, Switzerland. Connect with us
[X](https://twitter.com/so_income),
[Insta](https://instagram.com/so_income),
[LinkedIn](https://www.linkedin.com/company/socialincome),
[Facebook](https://facebook.com/socialincome.org) or by
[email](mailto:hello@socialincome.org).

### Radical Transparency

We believe that transparency builds trust and trust builds solidarity.
This is why we disclose our
[finances](https://socialincome.org/transparency/finances/usd) to the
public.

### Open Source Community

Open Source isn’t an exclusive club. It’s made by people just like you.
These individuals, amongst many others, have made significant
contributions to Social Income's success:

[![Contributors](https://contrib.rocks/image?repo=socialincome-san/public&columns=10)](https://github.com/socialincome-san/public/graphs/contributors)

### Software and IP Contributions

We receive in-kind donations from
[Google Nonprofit](https://www.google.com/nonprofits/),
[GitHub](https://socialimpact.github.com),
[Codemagic](https://codemagic.io/start/), [Linktree](https://linktr.ee),
[Twilio](https://twilio.org), [Algolia](https://www.algolia.com),
[JetBrains](https://www.jetbrains.com),
[Storyblok](https://www.storyblok.com),
[1Password](https://1password.com/), [Mux](https://www.mux.com/),
[Sentry](https://sentry.io) and [Lineto](https://www.lineto.com). Our
tools also leverage other open-source technologies, including solutions
like [FireCMS](https://firecms.co),
[Storybook](https://storybook.js.org) and
[Tailwind CSS](https://tailwindcss.com).

### Licensing Information

This project is licensed under [MIT](LICENSE), with the exception of the
[Unica77 font](https://lineto.com/typefaces/unica77), which is
exclusively licensed to Social Income.
