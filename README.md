#### &nbsp;&nbsp;#Tech4Good &nbsp;&nbsp;#OpenSource &nbsp;&nbsp;#Solidarity

![Social Income Logo](https://github.com/socialincome-san/public/blob/main/shared/assets/logos/logo_color@500px.png?raw=true)

```diff

Everybody cheers for equality but forgets that without economic justice, there can be no true equality.

```

#### Social Income explained

https://user-images.githubusercontent.com/6095849/191377786-10cdb4a1-5b25-4512-ade9-2cc0e153d947.mp4

### Social Income is a radically simple solution in the fight against poverty. We turn 1% of anyone's salary into an unconditional basic income for people living in poverty – sent directly to their mobile phones. The tools that make this possible are built and continuously improved upon by an open source community, who use technical skills to take on the SDG 1 ([No Poverty](https://sdgs.un.org/goals/goal1)) and the SDG 10 ([Reduced Inequality](https://sdgs.un.org/goals/goal10)).

### Our monorepo contains the following tools used to run Social Income:

1. [Admin Tool](#admin-tool) for managing contributors and recipients
   (`↗` [admin.socialincome.org](https://admin.socialincome.org))
2. [Mobile App](#mobile-app) for recipients (`↗` Google Play Store link
   added soon)
3. [Website](#website) for contributors (`↗`
   [socialincome.org](https://socialincome.org))

## Table of Contents

- **[Code Contributions](#code-contributions)**
  - [Admin Tool](#admin-tool)
  - [Mobile App](#mobile-app)
  - [User Interface (UI)](#user-interface)
  - [Website](#website)
  - [Shared](#shared)
- **[Financial Contributions](#financial-contributions)**
  - [1 Percent of Your Income](#1-percent-of-your-income)
  - [Sponsor Dev Community](#sponsor-dev-community)
- **[Organisation](#organisation)**
  - [Non-Profit Association](#non-profit-association)
  - [Radical Transparency](#radical-transparency)
  - [License](#license)

# Code Contributions

Don't forget: open source isn’t an exclusive club. It’s made by people
just like you. You don’t need to overthink what exactly your first
contribution will be, or how it will look. Just follow the principle:

1. Do something
2. Determine how to do it better
3. Rally others to help

## Admin Tool

Quick Links: `↗`
[Good first issues](https://github.com/socialincome-san/public/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22+label%3Aadmintool)
`↗`
[All issues](https://github.com/socialincome-san/public/issues?q=is%3Aopen+is%3Aissue+label%3Aadmintool)
`↗`
[Hacktoberfest 2022](https://github.com/socialincome-san/public/issues?q=is%3Aissue+is%3Aopen+label%3Ahacktoberfest)

#### Basic Setup

We are using [Firestore](https://firebase.google.com/docs/firestore) as
database and [FireCMS](https://firecms.co/) as UI tool. Staff can access
the admin tool via
[admin.socialincome.org](https://admin.socialincome.org). For
development we use [Docker](https://www.docker.com) and rely on local
emulators, which are populated with dummy seed data. This makes sure
that no one will require production Firebase credentials to contribute.

#### Getting Started

🕐 It takes a few minutes to download packages the first time

1. Build helper image locally: `docker compose build`
2. Start development server including Firebase emulators:
   `docker compose up admin`

This will expose the Admin Interface on
[`localhost:3000`](http://localhost:3000) and the Firebase Emulators on
[`localhost:4000`](http://localhost:4000).

#### Data Seed

⚠️ Don't include any sensitive data in the seed

An initial set of data is imported into the Firebase emulators during
startup. You can add, delete or amend data directly in the
[admin tool](https://admin.socialincome.org) or
[`localhost:4000`](http://localhost:4000). If you want to commit or keep
a local copy of your altered data set, you can execute in a second shell
(while emulator is still running) the command

```shell
 docker exec -it public-admin-1 npm run emulators:export
```

#### Backend Functions

`↓` see [Shared](#shared) > [Shared Functions](#shared-functions)

#### Run Tests

Run the following command to start the emulators and run the tests

```shell
 docker compose run admin npm run emulators:test
```

#### Format Code

We are using [Prettier](https://prettier.io) to format the code

```shell
docker compose run admin npm run format-code
```

#### Deployment

Deployment is handled automatically through
[GitHub actions](https://github.com/socialincome-san/public/actions).
The production Firebase keys are ingested through
[GitHub secrets](<[url](https://docs.github.com/en/actions/security-guides/encrypted-secrets)>).

When creating a PR, an action tests the code and deploys it with the
production credentials to a preview hosting. There, one can see the
proposed change with the production Firestore database as backend.

After merging the PR into main, a deployment action automatically
deploys the code to
[admin.socialincome.org](https://admin.socialincome.org).

## Mobile App

#### Basic Setup

Similar to `Admin Tool` the development doesn't require any production
Firebase credentials. We rely on local emulators which are populated
with dummy seed data. Follow `Admin Tool` setup to start emulators.

#### Getting Started

Open `recipients_app` project folder in your development environment of
choice. Building flavor should work seamlessly for Android Studio and VS
Code with predefined build configs.

We have two build flavors:

- `dev` -> Connecting with Firebase Emulators (Firestore and Auth)
- `prod` -> Connecting with production online firebase project and need
  real Firebase configuration json / plist file

For development use `dev` flavor.

As Firebase emulators work on your local host machine the easiest way to
run app is on the Android emulator. Real devices need some additional
setup.

## User Interface

#### Basic Setup

We build on reusable components for React and a test environment with
Storybook.

#### Getting Started

We recommend to use `make` with the `Makefile` in the root of the
project. Those commands run the project inside Docker.

```sh
# Build the UI. For one time builds e.g. production builds.
$ make build-ui

# Run the development server on http://localhost:6006. Just use this while developing for the UI.
$ make serve-ui
```

More instructions in the [`README.md` in `ui` subfolder](ui/README.md).

## Website

(Code and instructions to be added)

## Shared

Shared explanations, assets, code or functions for all three projects.

### Shared Functions

#### Basic Setup

We are using firebase functions to run backend jobs. Those can e.g. be
periodically triggered by pubsub cron definitions, by datastore triggers
or through web callbacks. We are using [Prettier](https://prettier.io)
to format the code.

#### Getting Started

These functions are mainly implemented using test-driven development.

1. Build helper image locally: `docker compose build`
2. Install dependencies: `docker compose run backend npm install`.
3. Run the tests including Firebase emulators:
   `docker compose run backend npm run emulators:test`. The first time
   this can take multiple minutes till the packages are downloaded.
4. With `docker compose run backend npm run serve` one can also serve
   the webhooks on localhost.

### Bug reporting / Feature Request

Please use one of the templates on our
[issue page](https://github.com/socialincome-san/public/issues/new/choose).

# Financial Contributions

## 1 Percent of Your Income

[Become a contributor](https://socialincome.org/get-involved) of Social
Income (tax-deductible in Switzerland).

## Sponsor Dev Community

[Become a sponsor](https://github.com/sponsors/san-socialincome) and
help ensure the development of open source software for more equality
and less poverty. Donations through the GitHub Sponsor program are used
for building a strong developer community and organizing Social Coding
Nights.

# Organisation

## Non-Profit Association

Social Income is a non-profit association
([CHE-289.611.695](https://www.uid.admin.ch/Detail.aspx?uid_id=CHE-289.611.695))
based in Zurich, Switzerland.

## Radical Transparency

We believe that transparency builds trust and trust builds solidarity.
This is why we disclose our
[finances in realtime](https://socialincome.org/finances) and publish
our [annual statements](https://socialincome.org/reporting) and overall
[carbon footprint](https://socialincome.org/sustainability).

## License

Code: [MIT](LICENSE)

Font: The font is licensed exclusively for the use on the website
socialincome.org and on the mobile apps of Social Income.
