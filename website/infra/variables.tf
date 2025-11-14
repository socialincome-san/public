variable "env" {
  description = "Environment name (e.g. staging, prod)"
  type        = string
}

variable "app_name" {
  description = "Internal name of the application (e.g. website)"
  type        = string
}

variable "gcp_project_id" {
  description = "GCP project ID"
  type        = string
}

variable "gcp_region" {
  description = "Deployment region"
  type        = string
}

variable "docker_image_url" {
  description = "URL of the Docker image in Artifact Registry"
  type        = string
}

variable "google_sql_db_password" {
  description = "Password for the Google SQL database user"
  type        = string
  sensitive   = true
}

variable "website_domain" {
  description = "Domain name for the website"
  type        = string
}

variable "scheduler_api_key" {
  description = "API key for the scheduler API endpoints"
  type        = string
  sensitive   = true
}
