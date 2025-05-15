output "cloud_run_url" {
  description = "The public URL of the deployed Cloud Run service"
  value       = google_cloud_run_service.portal.status[0].url
}

output "postgres_connection_url" {
  value = "postgresql://${google_sql_user.postgres_user.name}:${var.db_password}@${google_sql_database_instance.postgres_instance.connection_name}/${google_sql_database.default.name}"
}
