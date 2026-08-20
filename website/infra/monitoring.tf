data "google_monitoring_notification_channel" "slack_alerts" {
  type = "slack"
  labels = {
    channel_name = var.slack_alert_channel_name
  }
}

resource "google_monitoring_alert_policy" "slack_alerts" {
  display_name = "Cloud Run SLACK_ALERT logs (${var.env})"
  combiner     = "OR"
  enabled      = var.env == "prod"

  documentation {
    mime_type = "text/markdown"
    subject   = "SLACK_ALERT (${var.env}): $${log.extracted_label.message}"
    content   = <<-EOT
      **SLACK_ALERT** on ${google_cloud_run_service.google_cloud_run_service.name}

      $${log.extracted_label.message}
    EOT
  }

  conditions {
    display_name = "Log contains SLACK_ALERT (${var.env})"
    condition_matched_log {
      filter = <<-EOT
        resource.type="cloud_run_revision"
        resource.labels.service_name="${google_cloud_run_service.google_cloud_run_service.name}"
        textPayload:"SLACK_ALERT"
      EOT
      label_extractors = {
        message = "EXTRACT(textPayload)"
      }
    }
  }

  alert_strategy {
    notification_rate_limit {
      period = "300s"
    }
    auto_close = "3600s"
  }

  notification_channels = [
    data.google_monitoring_notification_channel.slack_alerts.name,
  ]

  depends_on = [google_project_service.monitoring]
}

locals {
  uptime_health_checks = {
    website = {
      path               = "/api/health/website"
      check_display_name = "Website (${var.env})"
      alert_name         = "Website unreachable (${var.env})"
      alert_content      = "GET https://${var.website_domain}/api/health/website failed. Cloud Run is unreachable, TLS failed, or the container is not responding."
    }
    database = {
      path               = "/api/health/database"
      check_display_name = "Website database (${var.env})"
      alert_name         = "Website DB down (${var.env})"
      alert_content      = "GET https://${var.website_domain}/api/health/database failed. Postgres did not answer SELECT 1."
    }
  }
}

resource "google_monitoring_uptime_check_config" "health" {
  for_each     = local.uptime_health_checks
  display_name = each.value.check_display_name
  timeout      = "10s"
  period       = "60s"

  http_check {
    path         = each.value.path
    port         = 443
    use_ssl      = true
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.gcp_project_id
      host       = var.website_domain
    }
  }

  content_matchers {
    content = "\"status\":\"ok\""
  }

  depends_on = [google_project_service.monitoring]
}

resource "google_monitoring_alert_policy" "uptime_health" {
  for_each     = local.uptime_health_checks
  display_name = each.value.alert_name
  combiner     = "OR"

  documentation {
    subject   = each.value.alert_name
    mime_type = "text/markdown"
    content   = each.value.alert_content
  }

  conditions {
    display_name = "${each.value.check_display_name} failed"
    condition_threshold {
      filter          = <<-EOT
        metric.type="monitoring.googleapis.com/uptime_check/check_passed"
        metric.label."check_id"="${google_monitoring_uptime_check_config.health[each.key].uptime_check_id}"
        resource.type="uptime_url"
      EOT
      duration        = "60s"
      comparison      = "COMPARISON_GT"
      threshold_value = 1

      aggregations {
        alignment_period     = "1200s"
        per_series_aligner   = "ALIGN_NEXT_OLDER"
        cross_series_reducer = "REDUCE_COUNT_FALSE"
        group_by_fields      = ["resource.label.*"]
      }

      trigger {
        count = 1
      }
    }
  }

  notification_channels = [
    data.google_monitoring_notification_channel.slack_alerts.name,
  ]

  alert_strategy {
    auto_close = "3600s"
  }

  depends_on = [google_project_service.monitoring]
}
