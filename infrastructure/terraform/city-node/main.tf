terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "project_id" {
  description = "The overarching GCP Project ID (The Hub)"
  type        = string
}

variable "city_name" {
  description = "Name of the city node (e.g., dubai, nairobi, addis_ababa)"
  type        = string
}

variable "gcp_region" {
  description = "The GCP region closest to the target city (e.g., me-central1 for Dubai)"
  type        = string
}

variable "database_url" {
  description = "The regional PostgreSQL instance URL (e.g., Supabase regional project URL)"
  type        = string
  sensitive   = true
}

# 1. Regional Cloud Run Service (The Sub-SaaS Node API)
# This deploys an isolated instance of the EDWL backend specifically for this city.
resource "google_cloud_run_v2_service" "city_node_api" {
  name     = "edwl-api-${var.city_name}"
  location = var.gcp_region
  project  = var.project_id
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "gcr.io/${var.project_id}/edwl-backend:latest"
      
      # Inject regional configurations dynamically
      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "CITY_NODE"
        value = var.city_name
      }
      env {
        name  = "DATABASE_URL"
        value = var.database_url
      }
      # Dynamic Edge Configuration Endpoint
      env {
        name  = "EDGE_CONFIG_URL"
        value = "https://hub.edwl.et/config/${var.city_name}.json"
      }
      
      resources {
        limits = {
          cpu    = "2"
          memory = "1024Mi"
        }
      }
    }
    
    scaling {
      min_instance_count = 1  # Always keep one warm to prevent cold starts
      max_instance_count = 50 # Scale up automatically during high traffic
    }
  }
}

# 2. Regional Cloud Storage Bucket (For KYC Documents & Profile Photos)
# Ensuring data sovereignty laws are respected (data stays in the city's region)
resource "google_storage_bucket" "city_node_storage" {
  name          = "edwl-storage-${var.city_name}-${var.project_id}"
  location      = var.gcp_region
  project       = var.project_id
  force_destroy = false

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  cors {
    origin          = ["https://${var.city_name}.edwl.et"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# 3. Output the deployed URL for the Edge Router
output "regional_api_url" {
  value       = google_cloud_run_v2_service.city_node_api.uri
  description = "The URL of the newly deployed regional Node API"
}
