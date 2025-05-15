resource "google_sql_database_instance" "postgres_instance" {
  name             = "portal-postgres"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = "db-f1-micro"

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.self_link
    }

    backup_configuration {
      enabled = true
    }
  }
  depends_on = [
    google_service_networking_connection.private_vpc_connection
  ]
}
resource "google_sql_database" "default" {
  name     = "social-income"
  instance = google_sql_database_instance.postgres_instance.name
}

resource "google_sql_user" "postgres_user" {
  name     = "portaluser"
  instance = google_sql_database_instance.postgres_instance.name
  password = var.db_password
}


