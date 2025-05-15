variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "Deployment region"
  type        = string
  default     = "europe-west1"
}

variable "image_url" {
  description = "URL of the Docker image in Artifact Registry"
  type        = string
}
