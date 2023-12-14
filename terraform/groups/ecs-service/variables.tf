# ------------------------------------------------------------------------------
# Environment
# ------------------------------------------------------------------------------
variable "environment" {
  type        = string
  description = "The environment name, defined in envrionments vars."
}
variable "aws_region" {
  default     = "eu-west-2"
  type        = string
  description = "The AWS region for deployment."
}
variable "aws_profile" {
  default     = "development-eu-west-2"
  type        = string
  description = "The AWS profile to use for deployment."
}

# ------------------------------------------------------------------------------
# Docker Container
# ------------------------------------------------------------------------------
variable "docker_registry" {
  type        = string
  description = "The FQDN of the Docker registry."
}

# ------------------------------------------------------------------------------
# Service performance and scaling configs
# ------------------------------------------------------------------------------
variable "desired_task_count" {
  type = number
  description = "The desired ECS task count for this service"
  default = 1 # defaulted low for dev environments, override for production
}
variable "required_cpus" {
  type = number
  description = "The required cpu resource for this service. 1024 here is 1 vCPU"
  default = 128 # defaulted low for dev environments, override for production
}
variable "required_memory" {
  type = number
  description = "The required memory for this service"
  default = 256 # defaulted low for node service in dev environments, override for production
}
variable "use_fargate" {
  type        = bool
  description = "If true, sets the required capabilities for all containers in the task definition to use FARGATE, false uses EC2"
  default     = false
}

# ------------------------------------------------------------------------------
# Service environment variable configs
# ------------------------------------------------------------------------------
 variable "log_level" {
  default     = "info"
  type        = string
  description = "The log level for services to use: trace, debug, info or error"
}

variable "officer_filing_web_version" {
  type        = string
  description = "The version of the officer filing web container to run."
}

variable "chs_url" {
  type        = string
}
variable "cdn_host" {
  type        = string
}
variable "account_local_url" {
  type        = string
}

variable "piwik_url" {
  type        = string
}
variable "piwik_site_id" {
  type        = string
}
variable "redirect_uri" {
  type        = string
  default     = "/"
}
variable "cache_pool_size" {
  type        = string
  default     = "8"
}
variable "cookie_domain" {
  type        = string
}
variable "cookie_name" {
  type        = string
  default     = "__SID"
}
variable "cookie_secure_only" {
  type        = string
  default     = "0"
}
variable "default_session_expiration" {
  type        = string
  default     = "3600"
}
variable "service_name" {
  type        = string
}
variable "show_service_offline_page" {
  type        = string
}
variable "feature_flag_ap01_web" {
  type        = string
}
variable "feature_flag_ch01_web" {
  type        = string
}
variable "title_list" {
  type        = string
}
variable "feature_flag_remove_director_20022023" {
  type        = string
}
variable "feature_flag_tm01_web" {
  type        = string
}
variable "ewf_url" {
  type        = string
}
variable "api_url" {
  type        = string
}
variable "piwik_start_goal_id" {
  type        = string
}
variable "piwik_remove_director_start_goal_id" {
  type        = string
}
variable "piwik_appoint_director_start_goal_id" {
  type        = string
}
variable "occupation_list" {
  type        = string
}
variable "nationality_list" {
  type        = string
}
variable "country_list" {
  type        = string
}
variable "uk_country_list" {
  type        = string
}
variable "postcode_address_lookup_url" {
  type        = string
}
variable "locales_enabled" {
  type        = string
}
variable "locales_path" {
  type        = string
}
variable "ch_node_utils_log_lvl" {
  type        = string
}
