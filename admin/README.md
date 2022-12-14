# Admin Tool

We are using [Firestore](https://firebase.google.com/docs/firestore) as
database and [FireCMS](https://firecms.co/) as UI tool. Staff can access
the admin tool via
[admin.socialincome.org](https://admin.socialincome.org).

The admin is a react frontend app. All the access patterns for the
firestore collections are configured through the firestore security
rules.

Random change

## Basic Setup

For the basic setup, please refer to the main [README](../README.md)

## Getting Started

Execute

```
make admin-serve
```

which launches the admin tool on [localhost:3000](localhost:3000) and
the required dependencies (firestore, functions).

⚠️ The first time this takes a while since a) the packages might need to
be installed b) the typescript code needs to be compiled.

## Data Seed

See the main [README.md](../README.md) how you can add new data to the
seed.

## Call functions from Admin

One can call backend functions directly from the admin. For example to
send an email.
[This](https://github.com/socialincome-san/public/blob/5eee5a7610e3402f47f6ff94bd810ee5713eb078/admin/src/CallDummyFunctionButton.tsx)
dummy admin button for exmaple calls
[this](https://github.com/socialincome-san/public/blob/5eee5a7610e3402f47f6ff94bd810ee5713eb078/functions/src/dummy/dummyFunction.ts#L4)
function.

## Testing

Run `make admin-test` to run the tests locally.

## Deployment

Deployment is handled automatically through the
[Admin Github Worklow](../.github/workflows/admin.yml).

The production Firebase keys are ingested through
[GitHub secrets](<[url](https://docs.github.com/en/actions/security-guides/encrypted-secrets)>).

When creating a PR, the action tests the code and deploys it with the
production credentials to a preview hosting. There, one can see the
proposed change with the production Firestore database as backend.

After merging the PR into main, the action automatically deploys the
code to [admin.socialincome.org](https://admin.socialincome.org).
