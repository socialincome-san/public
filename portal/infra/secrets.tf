data "google_secret_manager_secret_version" "google_secret_manager_secret_version" {
  secret  = "${var.env}-${var.app_name}-db-password"
  version = "latest"
}
