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

        env {
          name  = "POSTFINANCE_FTP_HOST"
          value = var.postfinance_ftp_host
        }

        env {
          name  = "POSTFINANCE_FTP_PORT"
          value = var.postfinance_ftp_port
        }

        env {
          name  = "POSTFINANCE_FTP_USER"
          value = var.postfinance_ftp_user
        }

        env {
          name  = "POSTFINANCE_PAYMENTS_FILES_BUCKET"
          value = var.postfinance_payments_files_bucket
        }

        env {
          name  = "POSTFINANCE_FTP_RSA_PRIVATE_KEY_BASE64"
          value = var.postfinance_ftp_rsa_private_key_base64
        }

        env {
          name  = "STRIPE_PRODUCT_ONETIME"
          value = var.stripe_product_onetime
        }

        env {
          name  = "STRIPE_PRODUCT_RECURRING"
          value = var.stripe_product_recurring
        }

        env {
          name  = "STRIPE_SECRET_KEY"
          value = var.stripe_secret_key
        }

        env {
          name  = "STRIPE_WEBHOOK_SECRET"
          value = var.stripe_webhook_secret
        }
        env {
          name  = "SENDGRID_API_KEY"
          value = var.sendgrid_api_key
        }

        env {
          name  = "SENDGRID_LIST_ID"
          value = var.sendgrid_list_id
        }

        env {
          name  = "SENDGRID_SUPPRESSION_LIST_ID"
          value = var.sendgrid_suppression_list_id
        }

        env {
          name  = "TWILIO_ACCOUNT_SID"
          value = var.twilio_account_sid
        }

        env {
          name  = "TWILIO_AUTH_TOKEN"
          value = var.twilio_auth_token
        }

        env {
          name  = "TWILIO_VERIFY_SERVICE_SID"
          value = var.twilio_verify_service_sid
        }

        env {
          name  = "BASE_URL"
          value = var.base_url
        }

        env {
          name  = "EXCHANGE_RATES_API"
          value = var.exchange_rates_api
        }

        env {
          name  = "GITHUB_PAT"
          value = var.github_pat
        }

        env {
          name  = "NEXT_PUBLIC_FACEBOOK_TRACKING_ID"
          value = var.next_public_facebook_tracking_id
        }

        env {
          name  = "NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID"
          value = var.next_public_google_tag_manager_id
        }

        env {
          name  = "NEXT_PUBLIC_LINKEDIN_TRACKING_ID"
          value = var.next_public_linkedin_tracking_id
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
