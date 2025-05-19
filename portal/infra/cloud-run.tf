resource "google_cloud_run_service" "google_cloud_run_service" {
  name     = "${var.env}-${var.app_name}-google-cloud-run-service"
  location = var.gcp_region

  template {
    metadata {
      annotations = {
        "run.googleapis.com/vpc-access-connector" = google_vpc_access_connector.google_vpc_access_connector.name
        "run.googleapis.com/vpc-access-egress"    = "all-traffic"
      }
    }

    spec {
      containers {
        image = var.docker_image_url

        env {
          name  = "DATABASE_URL"
          value = "postgresql://${google_sql_user.google_sql_user.name}:${var.db_password}@/${google_sql_database.google_sql_database.name}?host=/cloudsql/${google_sql_database_instance.google_sql_database_instance.connection_name}"
        }

        ports {
          container_port = 3000
        }

        resources {
          limits = {
            memory = "1Gi"
          }
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_cloud_run_service_iam_member" "google_cloud_run_service_iam_member" {
  location = var.gcp_region
  service  = google_cloud_run_service.google_cloud_run_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_domain_mapping" "google_cloud_run_domain_mapping" {
  location = var.gcp_region
  name     = var.domain_name

  metadata {
    namespace = var.gcp_project_id
  }

  spec {
    route_name = google_cloud_run_service.google_cloud_run_service.name
  }
}
