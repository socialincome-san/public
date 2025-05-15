resource "google_cloud_run_service" "portal" {
  name     = "social-income-portal"
  location = var.region

  template {
    metadata {
      annotations = {
        "run.googleapis.com/vpc-access-connector" = google_vpc_access_connector.serverless.name
        "run.googleapis.com/vpc-access-egress"    = "all-traffic"
      }
    }

    spec {
      containers {
        image = var.image_url

        env {
          name  = "DATABASE_URL"
          value = "postgresql://${google_sql_user.postgres_user.name}:${var.db_password}@${google_sql_database_instance.postgres_instance.private_ip_address}/${google_sql_database.default.name}"
        }

        resources {
          limits = {
            memory = "1Gi"
          }
        }

        ports {
          container_port = 3000
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_cloud_run_service_iam_member" "public" {
  location = var.region
  service  = google_cloud_run_service.portal.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
