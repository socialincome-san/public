data "google_monitoring_notification_channel" "slack_alerts" {
  type = "slack"
  labels = {
    channel_name = var.slack_alert_channel_name
  }
}

resource "google_monitoring_alert_policy" "slack_alerts" {
  display_name = "Cloud Run SLACK_ALERT logs (${var.env})"
  combiner     = "OR"
  enabled      = true

  documentation {
    content   = "A Cloud Run log contained SLACK_ALERT. Open Logs Explorer and search for SLACK_ALERT on ${google_cloud_run_service.google_cloud_run_service.name}."
    mime_type = "text/markdown"
  }

  conditions {
    display_name = "Log contains SLACK_ALERT (${var.env})"
    condition_matched_log {
      filter = <<-EOT
        resource.type="cloud_run_revision"
        resource.labels.service_name="${google_cloud_run_service.google_cloud_run_service.name}"
        SEARCH("`SLACK_ALERT`")
      EOT
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
