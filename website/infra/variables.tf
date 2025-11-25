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

variable "website_domain" {
  description = "Domain name for the website"
  type        = string
}

variable "scheduler_api_key" {
  description = "API key for the scheduler API endpoints"
  type        = string
  sensitive   = true
}

variable "stripe_product_onetime" {
  description = "Stripe product ID for one-time payments"
  type        = string
  sensitive   = true
}

variable "stripe_product_recurring" {
  description = "Stripe product ID for recurring payments"
  type        = string
  sensitive   = true
}

variable "stripe_secret_key" {
  description = "Stripe secret API key"
  type        = string
  sensitive   = true
}

variable "stripe_webhook_secret" {
  description = "Stripe webhook signing secret"
  type        = string
  sensitive   = true
}
