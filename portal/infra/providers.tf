provider "google" {
  project = var.project_id
  region  = var.region
}

terraform {
  backend "gcs" {
    bucket = "social-income-tf-state"
    prefix = "portal"
  }
}