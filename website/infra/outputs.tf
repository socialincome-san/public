output "cloud_run_url" {
  description = "Public URL of the deployed Cloud Run service"
  value = try(google_cloud_run_service.google_cloud_run_service.status[0].url, "")
}
