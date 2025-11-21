resource "google_cloud_scheduler_job" "google_cloud_scheduler_job_exchange_rate" {
  name        = "exchange-rate-import-job"
  description = "Imports exchange rates into DB every day at midnight"
  schedule    = "0 0 * * *" # Cron expression for daily execution
  time_zone   = "UTC"

  http_target {
    http_method = "POST"
    uri         = "https://${var.website_domain}/api/portal/v1/exchange-rate"
    headers = {
      "x-api-key" = var.scheduler_api_key
    }
  }
}

resource "google_cloud_scheduler_job" "google_cloud_scheduler_job_post_finance_import" {
  name        = "post-finance-import-job"
  description = "Imports payment files into Firebase Storage and extracts payment events and contributions into DB every hour"
  schedule    = "0 * * * *" # Cron expression for hourly execution
  time_zone   = "UTC"

  http_target {
    http_method = "POST"
    uri         = "https://${var.website_domain}/api/portal/v1/payment-files-import"
    headers = {
      "x-api-key" = var.scheduler_api_key
    }
  }
}
