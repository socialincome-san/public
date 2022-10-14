#### &nbsp;&nbsp;#Tech4Good &nbsp;&nbsp;#OpenSource &nbsp;&nbsp;#Solidarity

![Social Income Logo](https://github.com/socialincome-san/public/blob/main/shared/assets/logos/logo_color@500px.png?raw=true)

> Social Income is a radically simple solution in the fight against poverty. We turn 1% of anyone's salary into an unconditional basic income for people living in poverty – sent directly to their mobile phones. The tools that make this possible are built and continuously improved upon by an open source community, who use technical skills to take on the SDG 1 ([No Poverty](https://sdgs.un.org/goals/goal1)) and the SDG 10 ([Reduced Inequality](https://sdgs.un.org/goals/goal10)).

https://user-images.githubusercontent.com/6095849/191377786-10cdb4a1-5b25-4512-ade9-2cc0e153d947.mp4

> Everybody cheers for equality
> but forgets that without economic justice,
> there can be no true equality.

### Our monorepo contains the following tools used to run Social Income:

- Admin Tool for managing contributors and recipients
  ([README](admin/README.md), `↗` [admin.socialincome.org](https://admin.socialincome.org))
- Mobile App for recipients (([README](recipients_app/README.md), `↗` Google Play Store link added soon)
- Firebase Functions for scheduled functions, firestore triggers and webhooks ([README](functions/README.md))
- User Interface for reusable user interface react components manged with storybook ([README](ui/README.md))
- Website for contributors (`↗`
  [socialincome.org](https://socialincome.org)) (to be migrated to the public repository)
- Survey tool for impact measurement([README](survey/README.md)))

# Code Contributions

Don't forget: open source isn’t an exclusive club. It’s made by people just like you. You don’t need to overthink what
exactly your first contribution will be, or how it will look. Thank you:

[![Contributors](https://contrib.rocks/image?repo=socialincome-san/public&columns=10)](https://github.com/socialincome-san/public/graphs/contributors)

## Quick Links

- [Good first issues](https://github.com/socialincome-san/public/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22)
- [All issues](https://github.com/socialincome-san/public/issues?q=is%3Aopen+is%3Aissue)
- [Hacktoberfest 2022](https://github.com/socialincome-san/public/issues?q=is%3Aissue+is%3Aopen+label%3Ahacktoberfest)

## Stack

We are using [Firebase](https://firebase.google.com) as development platform. We are mainly leveraging the following
tools:

- [Firestore](https://firebase.google.com/docs/firestore) for data management
- [Firebase Authentication](https://firebase.google.com/docs/auth) for user management
- [Firebase Hosting](https://firebase.google.com/docs/hosting) to serve static content like the admin app
- [Firebase Functions](https://firebase.google.com/docs/functions) to run backend code in a serverless framework

### Development Setup

For development we use [Docker](https://www.docker.com) and rely on local
[Firebase Emulators](https://firebase.google.com/docs/emulator-suite), which are populated with dummy seed data. Ensures
that no one will require production Firebase credentials to contribute.

To avoid any operating system specific installation, we use a [helper docker image](Dockerfile)
and [docker-compose](docker-compose.yaml) file to run the npm commands and to start the emulators.

1. Build helper image locally run: `docker compose build`
2. The [Makefile](Makefile) gives you a good overview of the available commands. E.g. `make firebase-serve` starts the
   firebase emulators on [localhost:4000](localhost:4000)
3. Visit the READMEs in the submodules for detailed instructions

### Data Seed

⚠️ Don't include any sensitive data in the seed

An initial set of data is imported into the Firebase emulators during startup.

Start the firestore emulator and our admin with:

```
make admin-serve
```

You can add, delete or amend data directly in the
[Social Income Admin](http://localhost:3000) or in the
[Firestore Admin Interface](http://localhost:4000/firestore/data).

If you want to commit or keep a local copy of your altered data set, you can execute in a second shell
(while the command above still is running) the command

```
 make firebase-export
```

### Format Code

We are using [Prettier](https://prettier.io) to format the code

```shell
make format-code
```

### Deployment

Testing and deployment of the services is handled automatically through the
[GitHub actions](.github/workflows).

### Backup

We have
a [function](https://console.cloud.google.com/logs/query;query=resource.type%3D%22cloud_function%22%20resource.labels.function_name%3D%22siWebFirestoreExport%22%20resource.labels.region%3D%22us-central1%22?project=social-income-prod&authuser=1&hl=en)
which triggers hourly backups of our production firestore database.

The exports are saved to
the [social-income-prod](https://console.cloud.google.com/storage/browser/social-income-prod;tab=objects?forceOnBucketsSortingFiltering=false&authuser=1&project=social-income-prod&prefix=&forceOnObjectsSortingFiltering=true)
bucket with a retention period of 30 days. 

To restore the database you
can [import](https://console.cloud.google.com/firestore/import-export?authuser=1&project=social-income-prod) the most
recent folder directly from the [social-income-prod](https://console.cloud.google.com/storage/browser/social-income-prod;tab=objects?forceOnBucketsSortingFiltering=false&authuser=1&project=social-income-prod&prefix=&forceOnObjectsSortingFiltering=true)
bucket.

### Bug reporting / Feature Request

Please use one of the templates on our
[issue page](https://github.com/socialincome-san/public/issues/new/choose).

# Financial Contributions

## 1 Percent of Your Income

[Become a contributor](https://socialincome.org/get-involved) of Social Income (tax-deductible in Switzerland).

## Sponsor Dev Community

[Become a sponsor](https://github.com/sponsors/san-socialincome) and help ensure the development of open source software
for more equality and less poverty. Donations through the GitHub Sponsor program are used for building a strong
developer community and organizing Social Coding Nights.

# Organisation

## Non-Profit Association

Social Income is a non-profit association
([CHE-289.611.695](https://www.uid.admin.ch/Detail.aspx?uid_id=CHE-289.611.695))
based in Zurich, Switzerland.

![Twitter URL](https://img.shields.io/twitter/url?label=Follow%20%40so_income&style=social&url=https%3A%2F%2Ftwitter.com%2Fso_income)

## Radical Transparency

We believe that transparency builds trust and trust builds solidarity. This is why we disclose our
[finances in realtime](https://socialincome.org/finances) and publish
our [annual statements](https://socialincome.org/reporting) and overall
[carbon footprint](https://socialincome.org/sustainability).

## License

Code: [MIT](LICENSE)

Specifications: The font Unica77 is licensed exclusively for the use on the website socialincome.org and on the mobile
apps of Social Income. The contributors profile gallery has been made with
[contrib.rocks](https://contrib.rocks).
