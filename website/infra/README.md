# First-Time Terraform Setup — GCP Project Bootstrap

This guide walks you through the required setup before running Terraform
for the first time in a new GCP project (e.g., staging or prod).

## Step 1: Create the Terraform Deployer Service Account and Assign Roles

```
gcloud iam service-accounts create terraform-deployer \
  --project=social-income-staging \
  --description="Terraform deployer for staging infrastructure" \
  --display-name="Terraform Deployer"
```

```
gcloud projects add-iam-policy-binding social-income-staging \
  --member="serviceAccount:terraform-deployer@social-income-staging.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin"
```

```
gcloud projects add-iam-policy-binding social-income-staging \
  --member="serviceAccount:terraform-deployer@social-income-staging.iam.gserviceaccount.com" \
  --role="roles/cloudsql.admin"
```

```
gcloud projects add-iam-policy-binding social-income-staging \
  --member="serviceAccount:terraform-deployer@social-income-staging.iam.gserviceaccount.com" \
  --role="roles/compute.networkAdmin"
```

```
gcloud projects add-iam-policy-binding social-income-staging \
  --member="serviceAccount:terraform-deployer@social-income-staging.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

```
gcloud projects add-iam-policy-binding social-income-staging \
  --member="serviceAccount:terraform-deployer@social-income-staging.iam.gserviceaccount.com" \
  --role="roles/run.admin"
```

```
gcloud projects add-iam-policy-binding social-income-staging \
  --member="serviceAccount:terraform-deployer@social-income-staging.iam.gserviceaccount.com" \
  --role="roles/storage.admin"
```

```
gcloud projects add-iam-policy-binding social-income-staging \
  --member="serviceAccount:terraform-deployer@social-income-staging.iam.gserviceaccount.com" \
  --role="roles/serviceusage.serviceUsageAdmin"
```

```
gcloud projects add-iam-policy-binding social-income-staging \
  --member="serviceAccount:terraform-deployer@social-income-staging.iam.gserviceaccount.com" \
  --role="roles/vpcaccess.admin"
```

```
gcloud projects add-iam-policy-binding social-income-staging \
  --member="serviceAccount:terraform-deployer@social-income-staging.iam.gserviceaccount.com" \
  --role="roles/cloudscheduler.admin" \
  --condition=None
```

## Step 2: Create state bucket and assign roles

```
gsutil mb -p social-income-staging -l europe-west1 -b on gs://staging-website-tf-state
```

## Step 3: Allow the Terraform Deployer Service Account to access the state bucket

```
gsutil iam ch \
  serviceAccount:terraform-deployer@social-income-staging.iam.gserviceaccount.com:roles/storage.admin \
  gs://staging-website-tf-state
```

## Step 4: Create the Terraform Deployer Service Account Key

```
gcloud iam service-accounts keys create terraform-deployer-key.json \
  --project=social-income-staging \
  --iam-account=terraform-deployer@social-income-staging.iam.gserviceaccount.com
```

## Step 5: Add the Service Account Key to GitHub Secrets

Go to your GitHub repository settings, navigate to "Secrets and
variables" > "Actions", and add a new secret named
`TF_STAGING_TERRAFORM_DEPLOYER_CREDENTIALS`. Paste the content of
`terraform-deployer-key.json` into the secret.

## Step 6: Cloudflare DNS Setup

Add DNS records in Cloudflare pointing your domain to
ghs.googlehosted.com (used by Google to verify and route custom
domains). Important: Disable Cloudflare proxy temporarily when creating
the DNS record — this allows SSL certificate provisioning via Cloud Run.
Once the certificate is issued, you can re-enable the proxy. Also make a
DNS record for www.

## Step 7: Deploy one time without the docker build step

We have a chicken-and-egg problem here: First we need to deploy the
artifact registry before we can build and push the docker image. So we
need to run the terraform apply command without the docker build step.

## Step 8: Deploy the infrastructure

It can be that the apply fails the first few times because the
activation of some required GCP services (APIs) takes some time. Also,
you will have to give access to the terraform deployer for the domain.
