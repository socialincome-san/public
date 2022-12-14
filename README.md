#### &nbsp;&nbsp;#Tech4Good &nbsp;&nbsp;#OpenSource &nbsp;&nbsp;#Solidarity &nbsp;&nbsp;#SDG1 &nbsp;&nbsp;#SDG10

![Social Income Logo](https://github.com/socialincome-san/public/blob/main/shared/assets/logos/logo_color@500px.png?raw=true)

https://user-images.githubusercontent.com/6095849/191377786-10cdb4a1-5b25-4512-ade9-2cc0e153d947.mp4

## Social Income is a radically simple solution in the fight against poverty. We turn 1% of anyone's salary into an unconditional basic income for people living in poverty – sent directly to their mobile phones. The tools that make this possible are built and continuously improved upon by an open source community, who use their technical skills to take on the [SDG 1](https://sdgs.un.org/goals/goal1) (No Poverty) and the [SDG 10](https://sdgs.un.org/goals/goal10) (Reduced Inequality).

# Code Contributions

For detailed guidelines please refer to the specific _readme_ and
_contributing_ files:

|     |                        Admin Tool                        |                     Website                     |                   Mobile App                   |                 Functions                 |                             UI                             |
| :-: | :------------------------------------------------------: | :---------------------------------------------: | :--------------------------------------------: | :---------------------------------------: | :--------------------------------------------------------: |
| 👥  |                        for staff                         |                for contributors                 |             for recipients with 📱             |              for developers               |                       for developers                       |
| 📝  |                [Readme](admin/README.md)                 |           [Readme](website/README.md)           |       [Readme](recipients_app/README.md)       |       [Readme](functions/README.md)       |                   [Readme](ui/README.md)                   |
| 👩🏻‍💻  |          [Contributing](admin/CONTRIBUTING.md)           |     [Contributing](website/CONTRIBUTING.md)     | [Contributing](recipients_app/CONTRIBUTING.md) | [Contributing](functions/CONTRIBUTING.md) |             [Contributing](ui/CONTRIBUTING.md)             |
| 🌐  | [admin.socialincome.org](https://admin.socialincome.org) | [socialincome.org](https://socialincome.org) \* |              App store links tba               |                     –                     | [SI Storybook](https://socialincome-san.github.io/public/) |

\* The website socialincome.org is currently rebuild with NextJS
(instead of VueJS) and the code base moved to this public repo. The
preview page (work in progress) for the new website you find
[here](https://public-dusky-eight.vercel.app).

Finding a good issue: `↗`
[Help wanted](https://github.com/socialincome-san/public/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22),
`↗`
[Good first issues](https://github.com/socialincome-san/public/contribute),
`↗`
[All issues](https://github.com/socialincome-san/public/issues?q=is%3Aopen+is%3Aissue)

### Development Setup

```
Visit the `Readme` and `Contributing` files in the submodules for detailed instructions
```

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

For development we use [Docker](https://www.docker.com) and rely on
local
[Firebase Emulators](https://firebase.google.com/docs/emulator-suite),
which are populated with dummy seed data. Ensures that no one will
require production Firebase credentials to contribute. To avoid any
operating system specific installation, we use a
[helper docker image](Dockerfile) and
[docker-compose](docker-compose.yaml) file to run the npm commands and
to start the emulators.

Build helper image locally run:

```
docker compose build
```

The [Makefile](Makefile) gives you a good overview of the available
commands. E.g. you can start the firebase emulators on
[localhost:3000](http://localhost:3000) with

```
make firebase-serve
```

### Data Seed

An initial set of data is imported into the Firebase emulators during
startup. You can add, delete or amend data directly in your local
[Social Income Admin](http://localhost:3000) or in your local
[Firestore Admin Interface](http://localhost:4000/firestore/data). Start
the firestore emulator and our admin with:

```
make admin-serve
```

If you want to commit (no sensitive data) or keep a local copy of your
altered data set, you can execute in a second shell (while the command
above still is running) the command

```
 make firebase-export
```

### Format Code

We are using [Prettier](https://prettier.io) to format the code

```shell
make format-code
```

### Deployment

Testing and deployment of the services is handled automatically through
the [GitHub actions](.github/workflows).

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

Thanks [Google Nonprofit](https://www.google.com/nonprofits/),
[GitHub](https://socialimpact.github.com),
[Codemagic](https://codemagic.io/start/), [Linktree](https://linktr.ee),
[Twilio](https://twilio.org), and [JetBrain](https://www.jetbrains.com).
Font Unica77 by [Lineto](https://www.lineto.com).

### License

Code: [MIT](LICENSE). The font Unica77 is licensed exclusively for the
use on the website socialincome.org and on the mobile apps of Social
Income.
