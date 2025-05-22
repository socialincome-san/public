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
          value = "postgresql://${google_sql_user.google_sql_user.name}:${var.db_password}@${google_sql_database_instance.google_sql_database_instance.private_ip_address}/${google_sql_database.google_sql_database.name}"
        }

        env {
          name  = "NEXT_PUBLIC_FIREBASE_APP_ID"
          value = var.next_public_firebase_app_id
        }

        env {
          name  = "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"
          value = var.next_public_firebase_measurement_id
        }

        env {
          name  = "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
          value = var.next_public_firebase_messaging_sender_id
        }

        env {
          name  = "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
          value = var.next_public_firebase_auth_domain
        }

        env {
          name  = "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
          value = var.next_public_firebase_project_id
        }

        env {
          name  = "FIREBASE_DATABASE_URL"
          value = var.firebase_database_url
        }

        env {
          name  = "FIREBASE_SERVICE_ACCOUNT_JSON"
          value = var.firebase_service_account_json
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

# Unfortunately, the domain mapping resource is not supported in the region we are using (europe-west6)
# So we have to point from cloudflare to the service URL directly
# Thats a little dangerous, because if the service URL changes, we have to update the DNS record manually
# But it should only change when we destroy and recreate the service (e.g. when we rename the service)
# https://cloud.google.com/run/docs/mapping-custom-domains
# resource "google_cloud_run_domain_mapping" "google_cloud_run_domain_mapping" {
#   location = var.gcp_region
#   name     = var.domain_name
#
#   metadata {
#     namespace = var.gcp_project_id
#   }
#
#   spec {
#     route_name = google_cloud_run_service.google_cloud_run_service.name
#   }
# }
