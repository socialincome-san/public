# Admin Tool

We are using [Firestore](https://firebase.google.com/docs/firestore) as
database and [FireCMS](https://firecms.co/) as UI tool. Staff can access
the admin tool via
[admin.socialincome.org](https://admin.socialincome.org). For
development we use [Docker](https://www.docker.com) and rely on local
emulators, which are populated with dummy seed data. This makes sure
that no one will require production Firebase credentials to contribute.

## Getting Started

1. Install docker
2. Run `make admin-serve` from the project root. This will build the docker image, install the dependencies,
   compile the typescript and start the server.

🕐 It takes a few minutes to download packages the first time

This will expose the Admin Interface on
[`localhost:3000`](http://localhost:3000) and the Firebase Emulators on
[`localhost:4000`](http://localhost:4000).

## Data Seed

⚠️ Don't include any sensitive data in the seed

An initial set of data is imported into the Firebase emulators during
startup. You can add, delete or amend data directly in the
[admin tool](http://localhost:3000) or in the
[firestore emulator](http://localhost:4000). If you want to commit or keep
a local copy of your altered data set, you can execute in a second shell
(while `make admin-serve` is still running) the command `make admin-export-seed`.

## Testing

Run `make admin-test` to run the tests locally.

## Deployment

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
