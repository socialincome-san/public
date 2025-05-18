data "google_secret_manager_secret_version" "google_secret_manager_secret_version" {
  secret  = "${var.env}_${var.app_name}_google_secret_manager_secret_version"
  version = "latest"
}
