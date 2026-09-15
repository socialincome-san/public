resource "google_cloud_scheduler_job" "google_cloud_scheduler_job_exchange_rate" {
  name        = "exchange-rate-import-job"
  description = "Imports exchange rates into DB every day at midnight"
  schedule    = "0 0 * * *" # Cron expression for daily execution
  time_zone   = "UTC"

  http_target {
    http_method = "POST"
    uri         = "https://${var.website_domain}/api/v1/exchange-rate"
    headers = {
      "x-api-key" = var.scheduler_api_key
    }
  }
}

resource "google_cloud_scheduler_job" "google_cloud_scheduler_job_reserves_calculation" {
  name        = "reserves-calculation-job"
  description = "Calculates reserves every day at midnight"
  schedule    = "0 0 * * *" # Cron expression for daily execution
  time_zone   = "UTC"

  http_target {
    http_method = "POST"
    uri         = "https://${var.website_domain}/api/v1/reserves-calculation"
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
    uri         = "https://${var.website_domain}/api/v1/payment-files-import"
    headers = {
      "x-api-key" = var.scheduler_api_key
    }
  }
}

resource "google_cloud_scheduler_job" "google_cloud_scheduler_job_monthly_summary" {
  name        = "monthly-summary-job"
  description = "Sends the monthly summary email on the first day of every month"
  schedule    = "0 8 1 * *" # Cron expression for the first day of every month at 08:00 UTC
  time_zone   = "UTC"

  http_target {
    http_method = "POST"
    uri         = "https://${var.website_domain}/api/v1/monthly-summary"
    headers = {
      "x-api-key" = var.scheduler_api_key
    }
  }
}
