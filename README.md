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
  - [Website](#website)
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

We are using [Firestore](https://firebase.google.com/docs/firestore) as database and
[FireCMS](https://firecms.co/) as UI tool. The staff can access the admin tool with ([admin.socialincome.org](https://admin.socialincome.org)).

#### Setup

We use docker for the development.

The development doesn't require any production Firebase credentials.
We rely on local emulators which are populated with dummy seed data.

1. Build helper image locally: `docker compose build`
2. Start development server including Firebase emulators: `docker compose up admin`.
   The first time this can take multiple minutes till the packages are downloaded.

This will expose

- the [Admin Interface](http://localhost:3000) on `http://localhost:3000`
- the [Firebase Emulators](http://localhost:4000) on `http://localhost:4000`.
  Follow the links there to the different emulators.

#### Data Seed

A data seed is imported into the Firebase emulators during startup.
To update the seed after e.g. adding data to Firestore collection
you can export the current state of the emulators by executing in a new shell while the emulator is
up (with `docker compose up admin`).

Please ensure that you don't include any sensitive data in the seed.

```shell
 docker exec -it socialincome-admin_admin_1 npm run emulators:export
```

#### Run Tests

Run the following command to start the emulators and run the tests

```shell
 docker compose run admin npm run emulators:test
```

#### Format Code

We are using prettier to format the code

```shell
docker compose run admin npm run format-code
```

#### Deployment

Deployment is handled automatically through Github actions. The production Firebase keys are ingested through Github secrets.

When creating a PR, an action tests the code and deploys it with the production credentials to a preview hosting.
There, one can see the proposed change with the production Firestore database as backend.

After merging the PR into main, a deployment action automatically deploys the code to [admin.socialincome.org](https://admin.socialincome.org).

## Backend Functions

We are using firebase functions to run backend jobs.
Those can e.g. be periodically triggered
by pubsub cron definitions, by datastore triggers or through web callbacks.

### Setup

We develop these functions mainly test-driven.

1. Build helper image locally: `docker compose build`
2. Install dependencies: `docker compose run backend npm install`.
3. Run the tests including Firebase emulators: `docker compose run backend npm run emulators:test`.
   The first time this can take multiple minutes till the packages are downloaded.
4. With `docker compose run backend npm run serve` one can also serve the webhooks on localhost.

#### Format Code

We are using prettier to format the code

```shell
docker compose run backend npm run format-code
```

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

## Website

Code and instructions to be added

## Reporting Bugs

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
