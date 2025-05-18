resource "google_sql_database_instance" "google_sql_database_instance" {
  name             = "${var.env}-${var.app_name}_google_sql_database_instance"
  database_version = "POSTGRES_15"
  region           = var.gcp_region

  settings {
    tier = "db-f1-micro"
    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.google_compute_network.self_link
    }
    backup_configuration {
      enabled = true
    }
  }

  depends_on = [google_service_networking_connection.google_service_networking_connection]
}

resource "google_sql_database" "google_sql_database" {
  name     = "${var.env}-${var.app_name}_google_sql_database"
  instance = google_sql_database_instance.google_sql_database_instance.name
}

resource "google_sql_user" "google_sql_user" {
  name     = "${var.env}-${var.app_name}_google_sql_user"
  instance = google_sql_database_instance.google_sql_database_instance.name
  password = data.google_secret_manager_secret_version.google_secret_manager_secret_version.secret_data
}