# How to test the app for the release?

Usually for a upcoming release we test the app manually to ensure that
the core functionality is still working.

For that we use usually the environment STAGING.

- Here you find a description of the available
  [test environments](./test_environments.md), its usage and how to
  access them.

- Here you find the
  [manual test plans](../app_testing_guides/manual_test_plans.md).

- For the Apple App Store Review we have a hardcoded phone number
  +23271118897 in the backend with a real prod user account. When this
  test phone number is requesting a OTP code, we do not talk to Twilio
  and just reply SUCCESS. And in the Verify API we accept any OTP for
  that test phone number.

  This feature must be enabled in the backend before sending the app to
  the Apple Review. To do this you need to set a Terraform environment
  variable in GitHub. Here are the steps:
  - Go to
    https://github.com/socialincome-san/public/settings/variables/actions
  - Set TF_PROD_APP_REVIEW_MODE_ENABLED to true

  Unfortunatelly, this environment change has only an effect when a
  deployment is triggered and executed. We created a ticket to add a
  mechanism to the Admin Tool to make this easier to do. We also had the
  idea that after 10 days this setting is automatically disabled again.
  So for now, we left the feature on until we improved the usage.
