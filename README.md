#### &nbsp;&nbsp;#Tech4Good &nbsp;&nbsp;#OpenSource &nbsp;&nbsp;#Solidarity &nbsp;&nbsp;#SDG1 &nbsp;&nbsp;#SDG10

![Social Income Logo](https://github.com/socialincome-san/public/assets/6095849/e33d03b3-7502-46cc-bfe8-f70ff4374a0e)

https://user-images.githubusercontent.com/6095849/191377786-10cdb4a1-5b25-4512-ade9-2cc0e153d947.mp4

## Social Income is a radically simple solution in the fight against poverty. We turn 1% of anyone's salary into an unconditional basic income for people living in poverty – sent directly to their mobile phones. The tools that make this possible are built and continuously improved upon by an open source community, who use their technical skills to take on the [SDG 1](https://sdgs.un.org/goals/goal1) and the [SDG 10](https://sdgs.un.org/goals/goal10).

# Code Contributions

Finding a good issue: `↗`
[Help wanted](https://github.com/socialincome-san/public/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22),
`↗`
[Good first issues](https://github.com/socialincome-san/public/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22),
`↗`
[All issues](https://github.com/socialincome-san/public/issues?q=is%3Aopen+is%3Aissue)

### You can contribute to all three tools that run Social Income:

|                  |                                             Admin Tool                                              |                                               Website                                               |                                                                                  Mobile App                                                                                   |
| ---------------- | :-------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|                  | ![](https://github.com/socialincome-san/public/assets/6095849/42a8ce3e-4ff3-4d25-a298-1b4bc1570b0a) | ![](https://github.com/socialincome-san/public/assets/6095849/e4dbf692-d4b9-4253-88ea-2da7970919d8) |                                      ![](https://github.com/socialincome-san/public/assets/6095849/94d0f653-d894-4e9e-ab0d-b1cd8bfe9eab)                                      |
| **Purpose**      |                   Make it simple to manage payments, contributors and recipients                    |                               Raising donations and inform the public                               |                                                         Make it simple for recipients to manage payments and surveys                                                          |
| **Instructions** |                                      [Readme](admin/README.md)                                      |                                     [Readme](website/README.md)                                     |                                              [Readme](recipients_app/README.md) / [Contributing](recipients_app/CONTRIBUTING.md)                                              |
| **Localhost**    |               [localhost:3000](http://localhost:3000) / [4000](http://localhost:4000)               |                               [localhost:3001](http://localhost:3001)                               |                                                                                       –                                                                                       |
| **Staging**      |              [staging-admin.socialincome.org](https://staging-admin.socialincome.org)               |                    [staging.socialincome.org](https://staging.socialincome.org/)                    |                                                                                  Testflight                                                                                   |
| **Production**   |                      [admin.socialincome.org](https://admin.socialincome.org)                       |                           [socialincome.org](https://socialincome.org)\*                            | [iOS](https://apps.apple.com/ch/app/social-income/id6444860109?l=en-GB) / [Android](https://play.google.com/store/apps/details?id=org.socialincome.app&pcampaignid=web_share) |

The website and admin tool use [cloud functions](functions/README.md).
For frontend developers: you can also develop UI components with
Tailwind CSS independent of the website ([Readme](ui/README.md) /
[Contributing](ui/CONTRIBUTING.md)). The components are all collected in
our [Storybook](https://socialincome-san.github.io/public/).

\* The website socialincome.org is still on a private repo. In this repo,
we are rebuilding the existing website with Next.js, DaisyUI and Tailwind CSS. You
can visit the website in the making on
[staging](https://staging.socialincome.org/) or
[production](https://prod.socialincome.org/).

#### Basic steps to contribute

1. Choose an
   [issues](https://github.com/socialincome-san/public/issues?q=is%3Aopen+is%3Aissue)
   and leave a comment that you'd like to work on it (upon we assign it
   to you)
2. Clone the repo and work on it
3. Make a PR and wait for review - it will be merged by team if approved
   without comment
4. Your code is now merged into `main` branch and deployed on the
   staging environment
   ([admin](https://staging-admin.socialincome.org)/[web](https://staging.socialincome.org/))
5. Your code is then released on the production environment with the
   next release

Contributors who have done a few commits can deploy directly on the
staging environment without approval
([upon request](mailto:dev@socialincome.org)).

### Basic Development Setup

We are using [Firebase](https://firebase.google.com) as development
platform. We are mainly leveraging the following tools:
[Firestore](https://firebase.google.com/docs/firestore) for data
management,
[Firebase Authentication](https://firebase.google.com/docs/auth) for
user management,
[Firebase Hosting](https://firebase.google.com/docs/hosting) to serve
static content like the admin app,
[Firebase Functions](https://firebase.google.com/docs/functions) to run
backend code in a serverless framework and
[Firebase Storage](https://firebase.google.com/docs/storage) to store
documents and other files.

The local development environment is based on Node.js and uses the
[Firebase Emulators](https://firebase.google.com/docs/emulator-suite),
which are populated with dummy seed data. This ensures that no
production credentials are needed for local development.

Before you can start developing, you need to install the dependencies by
running. Make sure you are using Node.js 18. If you are using Homebrew,
you can install it with `brew install node@18` and follow
[this](https://ralphjsmit.com/switch-between-nodejs-versions-homebrew)
guide to switch between different versions of Node.js if need be. On
MacBook Pro (Intel) there seems to be an issue if you don't use exactly
the 18.15.0 Version:
[Download](https://nodejs.org/dist/v18.15.0/node-v18.15.0.pkg) /
[Issue](https://github.com/firebase/firebase-tools/issues/5614)

```shell
npm install
```

Once the dependencies are installed, you can start the different
environments:

- First, start the Firebase emulator with `npm run firebase:serve` —
  console dashboard is available at
  [localhost:4000](http://localhost:4000).
- To start the Admin Tool, run `npm run admin:serve` and open
  [localhost:3000](http://localhost:3000).
- To start the Website, run `npm run website:serve` and open
  [localhost:3001](http://localhost:3001).
- To start the Storybook, run `npm run ui:serve` and open
  [localhost:6006](http://localhost:6006).

The [package.json](package.json) file gives you a good overview of the
available commands. For more information on the development environment
see links in table above to tool specific Readme and Contributor files.

### Data Seed

An initial set of data is imported into the Firebase emulators during
startup of the Admin Tool. You can add, delete or amend data directly in
your local Admin Tool ([localhost:3000](http://localhost:3000)) or in
your local Firestore Admin Interface
([localhost:4000](http://localhost:4000/firestore/data)). After you have
made changes, you can export the data to the seed folder with
`npm run firebase:export`.

### Format Code

We are using [Prettier](https://prettier.io) to format the code:

```shell
npm run format-code
```

### Deployment

When a PR is merged into the `main` branch, the code is deployed to the
staging environment after being authorized by a core developer. See the
[Github Actions](./.github/workflows) for more details.

Production deployments are done manually through GitHub releases. A
release that begins with `release-` will trigger a production
deployment. The release should include the date of the release in the
format `YYYY-MM-DD`. For example, a release for a production deployment
on Feb 27th, 2021 would be `release-2021-02-27`. A second release on the
same day would be `release-2021-02-27.2`.

### Backup

We have a
[function](https://console.cloud.google.com/logs/query;query=resource.type%3D%22cloud_function%22%20resource.labels.function_name%3D%22siWebFirestoreExport%22%20resource.labels.region%3D%22us-central1%22?project=social-income-prod&authuser=1&hl=en)
which triggers hourly backups of our production firestore database. The
exports are saved to the
[social-income-prod](https://console.cloud.google.com/storage/browser/social-income-prod;tab=objects?forceOnBucketsSortingFiltering=false&authuser=1&project=social-income-prod&prefix=&forceOnObjectsSortingFiltering=true)
bucket with a retention period of 30 days. To restore the database you
can
[import](https://console.cloud.google.com/firestore/import-export?authuser=1&project=social-income-prod)
the most recent folder directly from the
[social-income-prod](https://console.cloud.google.com/storage/browser/social-income-prod;tab=objects?forceOnBucketsSortingFiltering=false&authuser=1&project=social-income-prod&prefix=&forceOnObjectsSortingFiltering=true)
bucket.

### Bugs & Feature Requests

You can report an issue or request a feature on our
[issue page](https://github.com/socialincome-san/public/issues/new/choose).
If you want to report a vulnareablity please refer to our
[security policy](https://github.com/socialincome-san/public/blob/main/SECURITY.md)

# Financial Contributions

### 1 Percent of Your Income

[Become a contributor](https://socialincome.org/get-involved) of Social
Income (tax-deductible in Switzerland).

### Sponsor Dev Community

[Become a sponsor](https://github.com/sponsors/socialincome-san) and
help ensure the development of open source software for more equality
and less poverty. Donations through the GitHub Sponsor program are used
for building a strong developer community and organizing Social Coding
Nights.

# Organisation

### Non-Profit Association

Social Income is a non-profit association
([CHE-289.611.695](https://www.uid.admin.ch/Detail.aspx?uid_id=CHE-289.611.695))
based in Zurich, Switzerland.

![Twitter URL](https://img.shields.io/twitter/url?label=Follow%20%40so_income&style=social&url=https%3A%2F%2Ftwitter.com%2Fso_income)

### Radical Transparency

We believe that transparency builds trust and trust builds solidarity.
This is why we disclose our
[finances in realtime](https://socialincome.org/finances) and publish
our [annual statements](https://socialincome.org/reporting) and overall
[carbon footprint](https://socialincome.org/sustainability).

### Open Source Community

Open Source isn’t an exclusive club. It’s made by people just like you.
You don’t need to overthink what exactly your first contribution will
be, or how it will look. Thank you:

[![Contributors](https://contrib.rocks/image?repo=socialincome-san/public&columns=10)](https://github.com/socialincome-san/public/graphs/contributors)

### Software & Design Donations

Thanks to [Google Nonprofit](https://www.google.com/nonprofits/),
[GitHub](https://socialimpact.github.com),
[Codemagic](https://codemagic.io/start/), [Linktree](https://linktr.ee),
[Twilio](https://twilio.org), and [JetBrain](https://www.jetbrains.com),
[1Password](https://1password.com/). Font Unica77 by
[Lineto](https://www.lineto.com).

### License

Code: [MIT](LICENSE). The font Unica77 is licensed exclusively for the
use on the website socialincome.org and on the mobile apps of Social
Income.
