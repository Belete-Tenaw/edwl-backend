# EDWL Global Hub-and-Spoke Infrastructure Architecture

terraform {
  required_version = ">= 1.5.0"
}

# 1. THE HUB (Global Infrastructure)
# This could include global load balancing, global Firebase Auth pool, etc.

# 2. THE SPOKES (Sub-SaaS City Nodes)
# To launch EDWL in a new city, simply add a new module block below and run `terraform apply`.
# It achieves 90% automated configuration as requested in the roadmap.

# Existing Spoke: Addis Ababa (Primary)
module "node_addis_ababa" {
  source       = "./city-node"
  project_id   = "edwl-global-hub"
  city_name    = "addis"
  # Closest GCP Region for East Africa
  gcp_region   = "me-central1"
  database_url = var.db_url_addis
}

# New Spoke Expansion: Dubai (Middle East Market)
module "node_dubai" {
  source       = "./city-node"
  project_id   = "edwl-global-hub"
  city_name    = "dubai"
  gcp_region   = "me-central1" # Doha/Dubai region
  database_url = var.db_url_dubai
}

# New Spoke Expansion: Nairobi (Kenya Market)
module "node_nairobi" {
  source       = "./city-node"
  project_id   = "edwl-global-hub"
  city_name    = "nairobi"
  gcp_region   = "europe-west3" # Example fallback if Africa region isn't ideal
  database_url = var.db_url_nairobi
}

# ----------------- Variables -----------------
variable "db_url_addis" { type = string, sensitive = true }
variable "db_url_dubai" { type = string, sensitive = true }
variable "db_url_nairobi" { type = string, sensitive = true }
