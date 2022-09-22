# Public Repo

![Social Income Logo](https://raw.githubusercontent.com/socialincome-san/public/main/shared/assets/logos/logo_color%402x.png)

**Our monorepo contains following projects:**

1. [Admin Tool](#admin-tool) for managing contributors and recipients (`↗` [admin.socialincome.org](https://admin.socialincome.org))
2. [Mobile App](#mobile-app) for recipients (`↗` Google Play Store link added soon)
3. [Website](#website) for contributors (`↗` [socialincome.org](https://socialincome.org))

## Table of Contents

- **[Code Contributions](#code-contributions)**
  - [Admin Tool](#admin-tool)
  - [Mobile App](#mobile-app)
  - [User Interface (UI)](#ui)
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

Use your skills to take on the SDG 1 ([No Poverty](https://sdgs.un.org/goals/goal1)) and
the SDG 10 ([Reduced Inequality](https://sdgs.un.org/goals/goal10)). Don't forget: open source isn’t an exclusive club. It’s made by people just like you. You don’t need to overthink what exactly your first contribution will be, or how it will look. Just follow the principle:

1. Do something
2. Determine how to do it better
3. Rally others to help

## Admin Tool

Quick Links: `↗` [Good first issues](https://github.com/socialincome-san/public/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22+label%3Aadmintool) `↗` [All issues](https://github.com/socialincome-san/public/issues?q=is%3Aopen+is%3Aissue+label%3Aadmintool)

#### Setup

We are using [Firestore](https://firebase.google.com/docs/firestore) as database and [FireCMS](https://firecms.co/) as UI tool. The staff can access the admin tool with on [admin.socialincome.org](https://admin.socialincome.org).

For the development we use [Docker](https://www.docker.com) and rely on local emulators, which are populated with dummy seed data. This makes sure, no one requires production Firebase credentials to contribute.

1. Build helper image locally: `docker compose build`
2. Start development server including Firebase emulators: `docker compose up admin`

🕐 For the first time, it takes a few minutes to download the packages

**This will expose the:**

- Admin Interface on [`localhost:3000`](http://localhost:3000)
- Firebase Emulators on [`localhost:4000`](http://localhost:4000) (follow links there to different emulators)

#### Data Seed

An initial set of data is imported into the Firebase emulators during startup. You can add, delete or amend data directly in the [admin tool](https://admin.socialincome.org) or [`localhost:4000`](http://localhost:4000). If you want to commit or keep a local copy of your altered data set, you can execute in a second shell (while emulator is still running) the command

```shell
 docker exec -it public-admin-1 npm run emulators:export
```

⚠️ Don't include any sensitive data in the seed

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

Deployment is handled automatically through [GitHub actions](https://github.com/socialincome-san/public/actions). The production Firebase keys are ingested through [GitHub secrets](<[url](https://docs.github.com/en/actions/security-guides/encrypted-secrets)>).

When creating a PR, an action tests the code and deploys it with the production credentials to a preview hosting. There, one can see the proposed change with the production Firestore database as backend.

After merging the PR into main, a deployment action automatically deploys the code to [admin.socialincome.org](https://admin.socialincome.org).

## Mobile App

#### Setup

Similar to `Admin Tool` the development doesn't require any production Firebase credentials.
We rely on local emulators which are populated with dummy seed data.

Follow `Admin Tool` setup to start emulators.

We have two build flavors:

- `dev` -> Connecting with Firebase Emulators (Firestore and Auth)
- `prod` -> Connecting with production online firebase project and need real Firebase configuration json / plist file

For development use `dev` flavor.

Open `recipients_app` project folder in your development environment of choice.
Building flavor should work seamlessly for Android Studio and VS Code with predefined build configs.

As Firebase emulators work on your local host machine the easiest way to run app is on the Android emulator.
Real devices need some additional setup.

## UI

[See `README.md` in `ui` subfolder](ui/README.md).

## Website

(Code and instructions to be added)

## Shared

Shared explanations, assets, code or functions for all three projects.

### Shared Functions

We are using firebase functions to run backend jobs. Those can e.g. be periodically triggered by pubsub cron definitions, by datastore triggers or through web callbacks. We are using [Prettier](https://prettier.io) to format the code.

#### Setup

We develop these functions mainly test-driven.

1. Build helper image locally: `docker compose build`
2. Install dependencies: `docker compose run backend npm install`.
3. Run the tests including Firebase emulators: `docker compose run backend npm run emulators:test`.
   The first time this can take multiple minutes till the packages are downloaded.
4. With `docker compose run backend npm run serve` one can also serve the webhooks on localhost.

### Bug reporting / Feature Request

Please use one of the templates on our [issue page](https://github.com/socialincome-san/public/issues/new/choose).

# Financial Contributions

## 1 Percent of Your Income

[Become a contributor](https://socialincome.org/get-involved) of Social Income (tax-deductible in Switzerland).

## Sponsor Dev Community

[Become a sponsor](https://github.com/sponsors/san-socialincome) and help ensure the development of open source software for more equality and less poverty. Donations through the GitHub Sponsor program are used for building a strong developer community and organizing Social Coding Nights.

# Organisation

## Non-Profit Association

Social Income is a non-profit association ([CHE-289.611.695](https://www.uid.admin.ch/Detail.aspx?uid_id=CHE-289.611.695)) in Zurich, Switzerland.

## Radical Transparency

We believe that transparency builds trust and trust builds solidarity. This is why we disclose our [finances in realtime](https://socialincome.org/finances) and publish our [annual statements](https://socialincome.org/reporting) and overall [carbon footprint](https://socialincome.org/sustainability).

## License

Code: [MIT](LICENSE)

Font: The font is licensed exclusively for the use on the website socialincome.org and in the mobile apps of Social Income.
