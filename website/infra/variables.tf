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

variable "postfinance_ftp_host" {
  description = "Host name for payment file FTP import"
  type        = string
}

variable "postfinance_ftp_port" {
  description = "Port for payment file FTP import"
  type        = string
}

variable "postfinance_ftp_user" {
  description = "User name for payment file FTP import"
  type        = string
}

variable "postfinance_payments_files_bucket" {
  description = "Firebase Storage Bucket name for payment file import"
  type        = string
}

variable "postfinance_ftp_rsa_private_key_base64" {
  description = "Private key for payment file FTP import"
  type        = string
  sensitive   = true
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

variable "sendgrid_api_key" {
  type      = string
  sensitive = true
}

variable "sendgrid_list_id" {
  type      = string
  sensitive = true
}

variable "sendgrid_suppression_list_id" {
  type      = string
  sensitive = true
}

variable "twilio_account_sid" {
  type      = string
  sensitive = true
}

variable "twilio_auth_token" {
  type      = string
  sensitive = true
}

variable "twilio_verify_service_sid" {
  type      = string
  sensitive = true
}

variable "base_url" {
  description = "Base URL of the website"
  type        = string
}

variable "exchange_rates_api" {
  description = "API key for exchange rates service"
  type        = string
  sensitive   = true
}

variable "github_pat" {
  description = "GitHub Personal Access Token for accessing private repositories"
  type        = string
  sensitive   = true
}

variable "app_build_timestamp" {
  description = "UTC timestamp of the build"
  type        = string
}

variable "firebase_database_url" {
  description = "Firebase Realtime Database URL"
  type        = string
  sensitive   = true
}

variable "firebase_service_account_json" {
  description = "Firebase Service Account JSON"
  type        = string
  sensitive   = true
}

variable "storyblok_preview_secret" {
  description = "Storyblok Preview Secret"
  type        = string
  sensitive   = true
}
