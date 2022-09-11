# Social Income Public Repository

Our repository contains following projects:

1. Admin Tool ([admin.socialincome.org](https://admin.socialincome.org)) for managing contributors and recipients
2. Mobile App (for recipients)
3. Website ([socialincome.org](https://admin.socialincome.org)) – code to be added

# Code Contribution

Use your skills to take on the [SDG 1](https://sdgs.un.org/goals/goal1) (No Poverty) and
the [SDG 10](https://sdgs.un.org/goals/goal10) (Reduced Inequality).

## Admin Tool ([admin.socialincome.org](https://admin.socialincome.org))

We are using [Firestore](https://firebase.google.com/docs/firestore) as database and
[FireCMS](https://firecms.co/) as UI tool.

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
 docker exec -it socialincome-admin_admin_1 yarn emulators:export
```

#### Run Tests

Run the following command to start the emulators and run the tests

```shell
 docker compose run admin yarn emulators:test
```

#### Format Code

We are using prettier to format the code

```shell
docker compose run admin yarn format-code
```

#### Deployment

Deployment is handled automatically through Github actions. The production Firebase keys are ingested through Github secrets.

When creating a PR, an action tests the code and deploys it with the production credentials to a preview hosting.
There, one can see the proposed change with the production Firestore database as backend.

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

## Website

Instructions to be added

## Reporting Bugs

Please use one of the templates on our [issue page](https://github.com/socialincome-san/public/issues/new/choose).

# Financial Contribution

## Donate 1%

[Become a contributor](https://socialincome.org/get-involved) of Social Income.

## Sponsor Dev Community

[Become a sponsor](https://github.com/sponsors/san-socialincome) and help ensure the development of open source software for more equality and less poverty. Donations through the GitHub Sponsor program are used for building a strong developer community and organizing Social Coding Nights.

# Legal

## Association

Social Income is a non-profit association in Zurich, Switzerland. We believe that transparency builds trust and trust builds solidarity. This is why we disclose our [finances in realtime](https://socialincome.org/finances) and publish our [annual statements](https://socialincome.org/reporting) and overall [carbon footprint](https://socialincome.org/sustainability).

## License

[MIT](LICENSE)
