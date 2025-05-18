resource "google_artifact_registry_repository" "google_artifact_registry_repository" {
  repository_id = "${var.env}_${var.app_name}_google_artifact_registry_repository"
  format        = "DOCKER"
  location      = var.gcp_region
}