resource "google_sql_database_instance" "postgres_instance" {
  name             = "portal-postgres"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = "db-f1-micro" # Use larger in prod (e.g., db-g1-small, db-custom-1-3840)

    ip_configuration {
      # Enable public IP temporarily if needed
      ipv4_enabled = true
      authorized_networks {
        name  = "allow-all"
        value = "0.0.0.0/0"
      }
    }

    backup_configuration {
      enabled = true
    }
  }
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


