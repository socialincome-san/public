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

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "next_public_firebase_app_id" {
  description = "Firebase App ID for the Next.js application"
  type        = string
  sensitive   = true
}

variable "next_public_firebase_measurement_id" {
  description = "Firebase Measurement ID for the Next.js application"
  type        = string
  sensitive   = true
}

variable "next_public_firebase_messaging_sender_id" {
  description = "Firebase Messaging Sender ID for the Next.js application"
  type        = string
  sensitive   = true
}

variable "firebase_database_url" {
  description = "Firebase Database URL"
  type        = string
  sensitive   = true
}

variable "firebase_service_account_json" {
  description = "Firebase service account JSON"
  type        = string
  sensitive   = true
}

variable "next_public_firebase_auth_domain" {
  description = "Firebase Auth Domain for the Next.js application"
  type        = string
  sensitive   = true
}

variable "next_public_firebase_project_id" {
  description = "Firebase Project ID for the Next.js application"
  type        = string
  sensitive   = true
}