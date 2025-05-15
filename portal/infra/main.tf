provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_artifact_registry_repository" "docker_repo" {
  repository_id = "portal-repo"
  format        = "DOCKER"
  location      = var.region
}

resource "google_cloud_run_service" "portal" {
  name     = "social-income-portal"
  location = var.region

  template {
    spec {
      containers {
        image = var.image_url
        ports {
          container_port = 3000
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_cloud_run_service_iam_member" "public" {
  location = var.region
  service  = google_cloud_run_service.portal.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
