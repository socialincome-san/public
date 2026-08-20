data "google_monitoring_notification_channel" "slack_alerts" {
  type = "slack"
  labels = {
    channel_name = var.slack_alert_channel_name
  }
}

locals {
  slack_notification_channels = [data.google_monitoring_notification_channel.slack_alerts.name]
  prod_alerts_enabled         = var.env == "prod"
  cloud_run_service_name      = google_cloud_run_service.google_cloud_run_service.name
  cloud_sql_database_id       = "${var.gcp_project_id}:${google_sql_database_instance.google_sql_database_instance.name}"

  uptime_health_checks = {
    website = {
      path               = "/api/health/website"
      timeout            = "10s"
      content            = "\"status\":\"ok\""
      check_display_name = "Website (${var.env})"
      alert_name         = "Website unreachable (${var.env})"
      alert_content      = "GET https://${var.website_domain}/api/health/website failed. Cloud Run is unreachable, TLS failed, or the container is not responding."
    }
    database = {
      path               = "/api/health/database"
      timeout            = "10s"
      content            = "\"status\":\"ok\""
      check_display_name = "Website database (${var.env})"
      alert_name         = "Website DB down (${var.env})"
      alert_content      = "GET https://${var.website_domain}/api/health/database failed. Postgres did not answer SELECT 1."
    }
    homepage = {
      path               = "/en/int"
      timeout            = "20s"
      content            = "<title>Social Income</title>"
      check_display_name = "Website homepage (${var.env})"
      alert_name         = "Website homepage down (${var.env})"
      alert_content      = "GET https://${var.website_domain}/en/int failed. SSR, Storyblok, or the public homepage is not returning a healthy page."
    }
  }

  scheduler_job_ids = [
    google_cloud_scheduler_job.google_cloud_scheduler_job_exchange_rate.name,
    google_cloud_scheduler_job.google_cloud_scheduler_job_reserves_calculation.name,
    google_cloud_scheduler_job.google_cloud_scheduler_job_post_finance_import.name,
  ]

  metric_alerts = {
    cloud_run_5xx = {
      display_name         = "Cloud Run 5xx (${var.env})"
      condition_name       = "More than 10 5xx in 5 minutes (${var.env})"
      content              = "Cloud Run ${local.cloud_run_service_name} returned more than ten 5xx responses in five minutes. Check OTP, checkout, recipients API, and SSR logs."
      filter               = <<-EOT
        resource.type="cloud_run_revision"
        resource.labels.service_name="${local.cloud_run_service_name}"
        metric.type="run.googleapis.com/request_count"
        metric.labels.response_code_class="5xx"
      EOT
      duration             = "0s"
      threshold            = 10
      alignment_period     = "300s"
      per_series_aligner   = "ALIGN_DELTA"
      cross_series_reducer = "REDUCE_SUM"
      group_by             = "resource.label.service_name"
    }
    cloud_sql_cpu = {
      display_name         = "Cloud SQL CPU high (${var.env})"
      condition_name       = "CPU utilization > 80% for 10 minutes (${var.env})"
      content              = "Postgres CPU on ${local.cloud_sql_database_id} stayed above 80% for 10 minutes."
      filter               = <<-EOT
        resource.type="cloudsql_database"
        resource.labels.database_id="${local.cloud_sql_database_id}"
        metric.type="cloudsql.googleapis.com/database/cpu/utilization"
      EOT
      duration             = "600s"
      threshold            = 0.8
      alignment_period     = "300s"
      per_series_aligner   = "ALIGN_MEAN"
      cross_series_reducer = "REDUCE_MEAN"
      group_by             = "resource.label.database_id"
    }
    cloud_sql_connections = {
      display_name         = "Cloud SQL connections high (${var.env})"
      condition_name       = "PostgreSQL backends > 80 for 5 minutes (${var.env})"
      content              = "Postgres on ${local.cloud_sql_database_id} had more than 80 connections for 5 minutes. Prod is db-g1-small; check Prisma pool usage and Cloud Run maxScale."
      filter               = <<-EOT
        resource.type="cloudsql_database"
        resource.labels.database_id="${local.cloud_sql_database_id}"
        metric.type="cloudsql.googleapis.com/database/postgresql/num_backends"
      EOT
      duration             = "300s"
      threshold            = 80
      alignment_period     = "60s"
      per_series_aligner   = "ALIGN_MAX"
      cross_series_reducer = "REDUCE_MAX"
      group_by             = "resource.label.database_id"
    }
    cloud_run_memory = {
      display_name         = "Cloud Run memory high (${var.env})"
      condition_name       = "Memory utilization p99 > 90% for 5 minutes (${var.env})"
      content              = "Cloud Run ${local.cloud_run_service_name} p99 memory utilization stayed above 90% for 5 minutes. The container limit is 1Gi."
      filter               = <<-EOT
        resource.type="cloud_run_revision"
        resource.labels.service_name="${local.cloud_run_service_name}"
        metric.type="run.googleapis.com/container/memory/utilizations"
      EOT
      duration             = "300s"
      threshold            = 0.9
      alignment_period     = "60s"
      per_series_aligner   = "ALIGN_PERCENTILE_99"
      cross_series_reducer = "REDUCE_MAX"
      group_by             = "resource.label.service_name"
    }
  }

  log_alerts = {
    scheduler_failed = {
      display_name   = "Cloud Scheduler job failed (${var.env})"
      condition_name = "Scheduler ERROR log (${var.env})"
      content        = "A scheduler job failed before or instead of writing SLACK_ALERT. Check ${join(", ", local.scheduler_job_ids)}."
      filter         = <<-EOT
        resource.type="cloud_scheduler_job"
        severity>=ERROR
        (
          ${join("\n  OR ", [for job_id in local.scheduler_job_ids : "resource.labels.job_id=\"${job_id}\""])}
        )
      EOT
    }
    cloud_run_oom = {
      display_name   = "Cloud Run out of memory (${var.env})"
      condition_name = "OOM log (${var.env})"
      content        = "Cloud Run ${local.cloud_run_service_name} killed a request because it exceeded the 1Gi memory limit."
      filter         = <<-EOT
        resource.type="cloud_run_revision"
        resource.labels.service_name="${local.cloud_run_service_name}"
        (
          textPayload:"exceeded the available memory"
          OR jsonPayload.message:"exceeded the available memory"
        )
      EOT
    }
  }
}

resource "google_monitoring_alert_policy" "slack_alerts" {
  display_name = "Cloud Run SLACK_ALERT logs (${var.env})"
  combiner     = "OR"
  enabled      = local.prod_alerts_enabled

  documentation {
    mime_type = "text/markdown"
    subject   = "SLACK_ALERT (${var.env})"
    content   = "$${log.extracted_label.message}$${log.extracted_label.json_message}"
  }

  conditions {
    display_name = "Log contains SLACK_ALERT (${var.env})"
    condition_matched_log {
      filter = <<-EOT
        resource.type="cloud_run_revision"
        resource.labels.service_name="${local.cloud_run_service_name}"
        (
          textPayload:"SLACK_ALERT"
          OR jsonPayload.message:"SLACK_ALERT"
        )
      EOT
      label_extractors = {
        message      = "EXTRACT(textPayload)"
        json_message = "EXTRACT(jsonPayload.message)"
      }
    }
  }

  alert_strategy {
    notification_rate_limit {
      period = "300s"
    }
    auto_close = "3600s"
  }

  notification_channels = local.slack_notification_channels

  depends_on = [google_project_service.monitoring]
}

resource "google_monitoring_uptime_check_config" "health" {
  for_each     = local.uptime_health_checks
  display_name = each.value.check_display_name
  timeout      = each.value.timeout
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
    content = each.value.content
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

  notification_channels = local.slack_notification_channels

  alert_strategy {
    auto_close = "3600s"
  }

  depends_on = [google_project_service.monitoring]
}

resource "google_monitoring_alert_policy" "metric" {
  for_each     = local.metric_alerts
  display_name = each.value.display_name
  combiner     = "OR"
  enabled      = local.prod_alerts_enabled

  documentation {
    mime_type = "text/markdown"
    subject   = each.value.display_name
    content   = each.value.content
  }

  conditions {
    display_name = each.value.condition_name
    condition_threshold {
      filter          = each.value.filter
      duration        = each.value.duration
      comparison      = "COMPARISON_GT"
      threshold_value = each.value.threshold

      aggregations {
        alignment_period     = each.value.alignment_period
        per_series_aligner   = each.value.per_series_aligner
        cross_series_reducer = each.value.cross_series_reducer
        group_by_fields      = [each.value.group_by]
      }

      trigger {
        count = 1
      }
    }
  }

  notification_channels = local.slack_notification_channels

  alert_strategy {
    auto_close = "3600s"
  }

  depends_on = [google_project_service.monitoring]
}

resource "google_monitoring_alert_policy" "logs" {
  for_each     = local.log_alerts
  display_name = each.value.display_name
  combiner     = "OR"
  enabled      = local.prod_alerts_enabled

  documentation {
    mime_type = "text/markdown"
    subject   = each.value.display_name
    content   = each.value.content
  }

  conditions {
    display_name = each.value.condition_name
    condition_matched_log {
      filter = each.value.filter
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

  notification_channels = local.slack_notification_channels

  depends_on = [google_project_service.monitoring]
}
