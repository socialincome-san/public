resource "google_compute_network" "google_compute_network" {
  name                    = "${var.env}-${var.app_name}-google-compute-network"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "google_compute_subnetwork" {
  name          = "${var.env}-${var.app_name}-google-compute-subnetwork"
  ip_cidr_range = "10.10.0.0/16"
  region        = var.gcp_region
  network       = google_compute_network.google_compute_network.id
}

resource "google_compute_global_address" "google_compute_global_address" {
  name          = "${var.env}-${var.app_name}-google-compute-global-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.google_compute_network.id
}

resource "google_service_networking_connection" "google_service_networking_connection" {
  network                 = google_compute_network.google_compute_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.google_compute_global_address.name]
  depends_on              = [google_compute_global_address.google_compute_global_address]
}

resource "google_vpc_access_connector" "google_vpc_access_connector" {
  name           = "${var.env}-${var.app_name}-connector"
  region         = var.gcp_region
  network        = google_compute_network.google_compute_network.name
  ip_cidr_range  = "10.8.0.0/28"
  min_throughput = 200
  max_throughput = 300
  depends_on     = [google_service_networking_connection.google_service_networking_connection]
}

resource "google_compute_router" "google_compute_router" {
  name    = "${var.env}-${var.app_name}-google-compute-router"
  network = google_compute_network.google_compute_network.name
  region  = var.gcp_region
}

resource "google_compute_router_nat" "google_compute_router_nat" {
  name                               = "${var.env}-${var.app_name}-google-compute-router-nat"
  router                             = google_compute_router.google_compute_router.name
  region                             = var.gcp_region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}