resource "google_cloud_run_service" "google_cloud_run_service" {
  name     = "${var.env}-${var.app_name}-google-cloud-run-service"
  location = var.gcp_region

  template {
    metadata {
      annotations = {
        "run.googleapis.com/vpc-access-connector" = google_vpc_access_connector.google_vpc_access_connector.name
        "run.googleapis.com/vpc-access-egress"    = "all-traffic"
        "autoscaling.knative.dev/minScale"        = "1"
      }
    }

    spec {
      containers {
        image = var.docker_image_url

        env {
          name  = "DATABASE_URL"
          value = "postgresql://${google_sql_user.google_sql_user.name}:${random_password.psql_admin_password.result}@${google_sql_database_instance.google_sql_database_instance.private_ip_address}/${google_sql_database.google_sql_database.name}?sslmode=require"
        }

        env {
          name  = "NEXT_PUBLIC_FEATURE_ENABLE_PORTAL"
          value = var.env == "prod" ? "false" : "true"
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

# Public access required for website availability
resource "google_cloud_run_service_iam_member" "google_cloud_run_service_iam_member" {
  location = var.gcp_region
  service  = google_cloud_run_service.google_cloud_run_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_domain_mapping" "cloudrun_domain_mapping_root" {
  name     = var.website_domain
  location = var.gcp_region

  metadata {
    namespace = var.gcp_project_id
  }

  spec {
    route_name = google_cloud_run_service.google_cloud_run_service.name
  }

  depends_on = [google_cloud_run_service.google_cloud_run_service]
}

resource "google_cloud_run_domain_mapping" "cloudrun_domain_mapping_www" {
  name     = "www.${var.website_domain}"
  location = var.gcp_region

  metadata {
    namespace = var.gcp_project_id
  }

  spec {
    route_name = google_cloud_run_service.google_cloud_run_service.name
  }

  depends_on = [google_cloud_run_service.google_cloud_run_service]
}