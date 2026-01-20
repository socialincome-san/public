resource "google_cloud_run_service" "google_cloud_run_service" {
  name     = "${var.env}-${var.app_name}-google-cloud-run-service"
  location = var.gcp_region

  template {
    metadata {
      annotations = {
        "run.googleapis.com/vpc-access-connector" = google_vpc_access_connector.google_vpc_access_connector.name
        "run.googleapis.com/vpc-access-egress"    = "all-traffic"
        "autoscaling.knative.dev/minScale"        = "1"
        "autoscaling.knative.dev/maxScale"        = "3"
      }
    }

    spec {
      containers {
        image = var.docker_image_url

        env {
          name  = "APP_BUILD_TIMESTAMP"
          value = var.app_build_timestamp
        }

        env {
          name  = "FIREBASE_DATABASE_URL"
          value = var.firebase_database_url
        }

        env {
          name  = "FIREBASE_SERVICE_ACCOUNT_JSON"
          value = var.firebase_service_account_json
        }

        env {
          name  = "STORYBLOK_PREVIEW_SECRET"
          value = var.storyblok_preview_secret
        }

        env {
          name  = "DATABASE_URL"
          value = "postgresql://${google_sql_user.google_sql_user.name}:${random_password.psql_admin_password.result}@${google_sql_database_instance.google_sql_database_instance.private_ip_address}/${google_sql_database.google_sql_database.name}?sslmode=require"
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
          name  = "SCHEDULER_API_KEY"
          value = var.scheduler_api_key
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
          name  = "TWILIO_API_KEY_SID"
          value = var.twilio_api_key_sid
        }

        env {
          name  = "TWILIO_API_KEY_SECRET"
          value = var.twilio_api_key_secret
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
          name  = "FEATURE_ENABLE_NEW_WEBSITE"
          value = var.env == "prod" ? "false" : "true"
        }

        env {
          name  = "APP_REVIEW_MODE_ENABLED"
          value = var.app_review_mode_enabled
        }

        env {
          name  = "APP_REVIEW_PHONE_NUMBER"
          value = var.app_review_phone_number
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
