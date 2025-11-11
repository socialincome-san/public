resource "google_cloud_scheduler_job" "google_cloud_scheduler_job" {
  name        = "exchange-rate-import-job"
  description = "Imports exchange rates into DB every day at midnight"
  schedule    = "0 0 * * *" # Cron expression for daily execution
  time_zone   = "UTC"

  http_target {
    http_method = "POST"
    uri         = "https://${var.website_domain}/api/portal/v1/exchange-rate"
    headers = {
      "x-api-key" = var.exchange_rate_import_api_key
    }
  }
}