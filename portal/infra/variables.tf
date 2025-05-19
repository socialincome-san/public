variable "env" {
  description = "Environment name (e.g. staging, prod)"
  type        = string
}

variable "app_name" {
  description = "Internal name of the application (e.g. portal)"
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

variable "domain_name" {
  description = "Custom domain for Cloud Run"
  type        = string
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}