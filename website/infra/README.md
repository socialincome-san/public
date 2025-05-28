rm First-Time Terraform Setup — GCP Project Bootstrap

This guide walks you through the required setup before running Terraform for the first time in a new GCP environment (e.g., staging or production).

Step 1: Create the Terraform Deployer Service Account and Assign Roles

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

Step 2: Create state bucket and assign roles

```
gsutil mb -p social-income-staging -l europe-west6 -b on gs://staging-website-terraform-state
```

Step 3: Allow the Terraform Deployer Service Account to access the state bucket

```
gsutil iam ch \
  serviceAccount:terraform-deployer@social-income-staging.iam.gserviceaccount.com:roles/storage.admin \
  gs://staging-website-terraform-state
```

Step 4: Create the Terraform Deployer Service Account Key

```
gcloud iam service-accounts keys create terraform-deployer-key.json \
  --project=social-income-staging \
  --iam-account=terraform-deployer@social-income-staging.iam.gserviceaccount.com
```