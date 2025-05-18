data "google_secret_manager_secret_version" "google_secret_manager_secret_version" {
  secret  = var.db_password_secret_name
  version = "latest"
}