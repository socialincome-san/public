locals {
  is_prod = var.env == "prod"
}

resource "random_password" "psql_admin_password" {
  length  = 16
  special = false

  keepers = {
    rotation = timestamp()
  }
}

resource "google_sql_database_instance" "google_sql_database_instance" {
  name                = "${var.env}-${var.app_name}-google-sql-database-instance"
  database_version    = "POSTGRES_18"
  region              = var.gcp_region
  deletion_protection = true

  settings {
    tier            = local.is_prod ? "db-g1-small" : "db-f1-micro"
    disk_autoresize = true

    database_flags {
      name  = "log_statement"
      value = local.is_prod ? "ddl" : "all"
    }

    ip_configuration {
      ipv4_enabled    = true
      private_network = google_compute_network.google_compute_network.self_link

      authorized_networks {
        name  = "smartive-zh-intern"
        value = "85.195.221.58/32"
      }

      authorized_networks {
        name  = "smartive-zh-dmz"
        value = "85.195.221.61/32"
      }

      authorized_networks {
        name  = "smartive-sg"
        value = "85.195.251.214/32"
      }
    }

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = local.is_prod
    }
  }

  depends_on = [google_service_networking_connection.google_service_networking_connection]
}

resource "google_sql_database" "google_sql_database" {
  name     = "${var.env}-${var.app_name}-google-sql-database"
  instance = google_sql_database_instance.google_sql_database_instance.name
}

resource "google_sql_user" "google_sql_user" {
  name     = "${var.env}-${var.app_name}_google_sql_user"
  instance = google_sql_database_instance.google_sql_database_instance.name
  password = random_password.psql_admin_password.result
}