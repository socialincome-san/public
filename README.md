#### &nbsp;&nbsp;#Tech4Good &nbsp;&nbsp;#OpenSource &nbsp;&nbsp;#Solidarity

![Social Income Logo](https://github.com/socialincome-san/public/assets/6095849/e33d03b3-7502-46cc-bfe8-f70ff4374a0e)

https://user-images.githubusercontent.com/6095849/191377786-10cdb4a1-5b25-4512-ade9-2cc0e153d947.mp4

## Social Income is a radically simple solution in the fight against poverty. The global open-source initiative converts donations into an unconditional basic income, which is sent directly to the mobile phones of people living in poverty in the Global South.

### ![SDG Icon](https://i.imgur.com/LHoR8Et.png) [SDG 1](https://sdgs.un.org/goals/goal1) &nbsp;&nbsp; ![SDG Icon](https://i.imgur.com/LHoR8Et.png) [SDG 10](https://sdgs.un.org/goals/goal10)

## OSS Tools by Social Income

|                  |                                                Admin Tool                                                 |                                                 Website                                                 |                                                                                  Mobile App                                                                                   |
| ---------------- | :-------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|                  |    ![](https://github.com/socialincome-san/public/assets/6095849/42a8ce3e-4ff3-4d25-a298-1b4bc1570b0a)    |   ![](https://github.com/socialincome-san/public/assets/6095849/e4dbf692-d4b9-4253-88ea-2da7970919d8)   |                                      ![](https://github.com/socialincome-san/public/assets/6095849/94d0f653-d894-4e9e-ab0d-b1cd8bfe9eab)                                      |
| **Purpose**      |                      Make it simple to manage payments, contributors and recipients                       |                                 Raising donations and inform the public                                 |                                                         Make it simple for recipients to manage payments and surveys                                                          |
| **Instructions** |                                         [Readme](admin/README.md)                                         |                                       [Readme](website/README.md)                                       |                                              [Readme](recipients_app/README.md) / [Contributing](recipients_app/CONTRIBUTING.md)                                              |
| **Localhost**    |                  [localhost:3000](http://localhost:3000) / [4000](http://localhost:4000)                  |                                 [localhost:3001](http://localhost:3001)                                 |                                                                                       –                                                                                       |
| **Staging**      |                 [staging-admin.socialincome.org](https://staging-admin.socialincome.org)                  |                      [staging.socialincome.org](https://staging.socialincome.org/)                      |                         [Testflight](https://developer.apple.com/testflight/) / [App Distribution](https://firebase.google.com/docs/app-distribution)                         |
| **Production**   |                         [admin.socialincome.org](https://admin.socialincome.org)                          |                              [socialincome.org](https://socialincome.org)                               | [iOS](https://apps.apple.com/ch/app/social-income/id6444860109?l=en-GB) / [Android](https://play.google.com/store/apps/details?id=org.socialincome.app&pcampaignid=web_share) |
| **Issues**       | [Open issues](https://github.com/socialincome-san/public/issues?q=is%3Aissue+is%3Aopen+label%3Aadmintool) | [Open issues](https://github.com/socialincome-san/public/issues?q=is%3Aissue+is%3Aopen+label%3Awebsite) |                                   [Open issues](https://github.com/socialincome-san/public/issues?q=is%3Aissue+is%3Aopen+label%3Amobileapp)                                   |

# Code Contributions

### Basic Steps to Contribute

1. Choose an issue and leave a comment that you'd like to work on it
   (upon we assign it to you) `↗`
   [All issues](https://github.com/socialincome-san/public/issues?q=is%3Aopen+is%3Aissue)
   `↗`
   [Help wanted](https://github.com/socialincome-san/public/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22)
   `↗`
   [Good first issues](https://github.com/socialincome-san/public/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22)

2. Setup the basic development environment (see below)
3. Clone the repo and work on it
4. Make a PR and wait for review - it will be merged by team if approved
   without comment
5. Your code is now merged into `main` branch and deployed on the
   staging environment
   ([Admin Tool](https://staging-admin.socialincome.org) /
   [Website](https://staging.socialincome.org/))
6. Your code is then released on the production environment with the
   next release

**Frontend developers:** You can also develop UI components with
[Tailwind CSS](https://tailwindcss.com) and
[shadcn/ui](https://ui.shadcn.com) independent of the website
([Readme](ui/README.md) / [Contributing](ui/CONTRIBUTING.md)). The
components are all collected in our
[Storybook](https://socialincome-san.github.io/public/).

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

#### 1. Install the dependencies

Make sure you are using Node.js 18. If you are using Homebrew, you can
install it with `brew install node@18` and follow
[this](https://ralphjsmit.com/switch-between-nodejs-versions-homebrew)
guide to switch between different versions of Node.js if need be.

```shell
npm install
```

#### 2. Start environment

Initiate development environments for specific tools as needed.

- Always start the Firebase emulator first with `npm run firebase:serve`
  — console dashboard is available at
  [localhost:4000](http://localhost:4000).
- To start the Admin Tool, run `npm run admin:serve` and open
  [localhost:3000](http://localhost:3000).
- To start the Website, run `npm run website:serve` and open
  [localhost:3001](http://localhost:3001).
- To start the Storybook, run `npm run ui:serve` and open
  [localhost:6006](http://localhost:6006).

The [package.json](package.json) file gives you a good overview of the
available commands. For more information on the development environment
see table above. No production credentials are needed for local
development.

### Data Seed

An initial set of data is imported into the Firebase emulators during
startup of the [Admin Tool](https://staging-admin.socialincome.org). You
can add, delete or amend data directly in your local Admin Tool
([localhost:3000](http://localhost:3000)) or in your local Firestore
Admin Interface
([localhost:4000](http://localhost:4000/firestore/data)). After you have
made changes, you can export the data to the seed folder with
`npm run firebase:export`.

### Format Code

We are using [Prettier](https://prettier.io) to format the code:

```shell
npm run format-code
```

### Deployments

**Staging deployments:** PRs merged into `main` are automatically
deployed to staging
([Admin Tool](https://staging-admin.socialincome.org) /
[Website](https://staging.socialincome.org/)) upon core developer
approval. Check [Github Actions](./.github/workflows) for details.
Experienced contributors can deploy directly
[without approval](mailto:dev@socialincome.org).

**Production deployments:** Deployments are made by core developers via
[GitHub releases](https://github.com/socialincome-san/public/actions/workflows/production-deployment.yml).
Use "release-YYYY-MM-DD" for the release name
(example:`release-2021-02-27`). For multiple releases on the same day,
append ".2", ".3", etc. (example:`release-2021-02-27.2`).

### Backups

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
[security policy](https://github.com/socialincome-san/public/blob/main/SECURITY.md).

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
[Twilio](https://twilio.org), [algolia](https://www.algolia.com),
[JetBrains](https://www.jetbrains.com),
[1Password](https://1password.com/) and
[Lineto](https://www.lineto.com). Our tools also leverage other
open-source technologies, including solutions like
[FireCMS](https://firecms.co), [Storybook](https://storybook.js.org) and
[Tailwind CSS](https://tailwindcss.com).

### Licensing Information

This project is licensed under [MIT](LICENSE), with the exception of the
[Unica77 font](https://lineto.com/typefaces/unica77), which is
exclusively licensed to Social Income.
