resource "google_artifact_registry_repository" "docker_repo" {
  repository_id = "portal-repo"
  format        = "DOCKER"
  location      = var.region
}