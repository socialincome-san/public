# Contributing Code for the Admin Tool

## Getting Started

Execute

```
make admin-serve
```

which launches the admin tool on [localhost:3000](localhost:3000) and
the required dependencies (firestore, functions).

⚠️ The first time this takes a while since the packages might need to be
installed the typescript code needs to be compiled.

## Data Seed

See the [Contributing.md](../seed/README.md) for the data seed, which
explains how you can add new data to the seed.

## Call Functions from Admin

One can call backend functions directly from the admin. For example to
send an email.
[This](https://github.com/socialincome-san/public/blob/5eee5a7610e3402f47f6ff94bd810ee5713eb078/admin/src/CallDummyFunctionButton.tsx)
dummy admin button for exmaple calls
[this](https://github.com/socialincome-san/public/blob/5eee5a7610e3402f47f6ff94bd810ee5713eb078/functions/src/dummy/dummyFunction.ts#L4)
function.

See the [Contributing.md](../functions/README.md) for the functions,
which explains how you can add new functions.

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
