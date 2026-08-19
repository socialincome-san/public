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
