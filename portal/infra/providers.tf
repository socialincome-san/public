provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

terraform {
  backend "gcs" {
    bucket = "${var.env}-${var.app_name}_terraform_state"
  }
}