resource "google_artifact_registry_repository" "google_artifact_registry_repository" {
  repository_id = "${var.env}-${var.app_name}-google-artifact-registry-repository"
  format        = "DOCKER"
  location      = var.gcp_region
}