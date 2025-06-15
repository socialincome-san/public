resource "google_project_service" "artifact_registry" {
  project = var.gcp_project_id
  service = "artifactregistry.googleapis.com"
}

resource "google_project_service" "sqladmin" {
  project = var.gcp_project_id
  service = "sqladmin.googleapis.com"
}

resource "google_project_service" "cloud_run" {
  project = var.gcp_project_id
  service = "run.googleapis.com"
}

resource "google_project_service" "vpcaccess" {
  project = var.gcp_project_id
  service = "vpcaccess.googleapis.com"
}

resource "google_project_service" "servicenetworking" {
  project = var.gcp_project_id
  service = "servicenetworking.googleapis.com"
}

resource "google_project_service" "secretmanager" {
  project = var.gcp_project_id
  service = "secretmanager.googleapis.com"
}

resource "google_project_service" "compute" {
  project = var.gcp_project_id
  service = "compute.googleapis.com"
}

resource "google_project_service" "cloudresourcemanager" {
  project = var.gcp_project_id
  service = "cloudresourcemanager.googleapis.com"
}

resource "google_project_service" "iam" {
  project = var.gcp_project_id
  service = "iam.googleapis.com"
}
