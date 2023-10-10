# Define all hardcoded local variable and local variables looked up from data resources
locals {
  stack_name                = "filing-maintain" # this must match the stack name the service deploys into
  name_prefix               = "${local.stack_name}-${var.environment}"
  service_name              = "officer-filing-web"
  container_port            = "3000" # default node port required here until prod docker container is built allowing port change via env var
  docker_repo               = "officer-filing-web"
  lb_listener_rule_priority = 40
  lb_listener_paths         = ["/appoint-update-remove-company-officer*"]
  healthcheck_path          = "/appoint-update-remove-company-officer" #healthcheck path for officer filing web
  healthcheck_matcher       = "200-302" # no explicit healthcheck in this service yet, change this when added!

  kms_alias                 = "alias/${var.aws_profile}/environment-services-kms"
  service_secrets           = jsondecode(data.vault_generic_secret.service_secrets.data_json)

  parameter_store_secrets    = {
      "vpc_name"                  = local.service_secrets["vpc_name"]
      "chs_api_key"               = local.service_secrets["chs_api_key"]
      "internal_api_url"          = local.service_secrets["internal_api_url"]
      "account_url"               = local.service_secrets["account_url"]
      "cache_server"              = local.service_secrets["cache_server"]
      "oauth2_client_id"          = local.service_secrets["oauth2_client_id"]
      "oauth2_client_secret"      = local.service_secrets["oauth2_client_secret"]
      "oauth2_request_key"        = local.service_secrets["oauth2_request_key"]
    }

    vpc_name                  = local.service_secrets["vpc_name"]
    chs_api_key               = local.service_secrets["chs_api_key"]
    internal_api_url          = local.service_secrets["internal_api_url"]
    account_url               = local.service_secrets["account_url"]
    cache_server              = local.service_secrets["cache_server"]
    oauth2_client_id          = local.service_secrets["oauth2_client_id"]
    oauth2_client_secret      = local.service_secrets["oauth2_client_secret"]
    oauth2_request_key        = local.service_secrets["oauth2_request_key"]

  # create a map of secret name => secret arn to pass into ecs service module
  # using the trimprefix function to remove the prefixed path from the secret name
  secrets_arn_map = {
    for sec in data.aws_ssm_parameter.secret:
      trimprefix(sec.name, "/${local.name_prefix}/") => sec.arn
  }

  service_secrets_arn_map = {
    for sec in module.secrets.secrets:
      trimprefix(sec.name, "/${local.service_name}-${var.environment}/") => sec.arn
  }

    # TODO: task_secrets don't seem to correspond with 'parameter_store_secrets'. What is the difference?
    task_secrets = [
      { "name": "COOKIE_SECRET", "valueFrom": "${local.secrets_arn_map.web-oauth2-cookie-secret}" },
      { "name": "CHS_API_KEY", "valueFrom": "${local.service_secrets_arn_map.chs_api_key}" },
      { "name": "CACHE_SERVER", "valueFrom": "${local.service_secrets_arn_map.cache_server}" },
      { "name": "OAUTH2_CLIENT_ID", "valueFrom": "${local.service_secrets_arn_map.oauth2_client_id}" },
      { "name": "OAUTH2_CLIENT_SECRET", "valueFrom": "${local.service_secrets_arn_map.oauth2_client_secret}" },
      { "name": "OAUTH2_REQUEST_KEY", "valueFrom": "${local.service_secrets_arn_map.oauth2_request_key}" },
      { "name": "INTERNAL_API_URL", "valueFrom": "${local.service_secrets_arn_map.internal_api_url}" },
      { "name": "ACCOUNT_URL", "valueFrom": "${local.service_secrets_arn_map.account_url}" }
    ]

  task_environment = [
    { "name": "AP01_WEB", "value": "${var.ap01_web}" },
    { "name": "API_URL", "value": "${var.api_url}" },
    { "name": "APPLICATIONS_API_URL", "value": "${var.account_local_url}" },
    { "name": "CACHE_POOL_SIZE", "value": "${var.cache_pool_size}" },
    { "name": "CDN_HOST", "value": "//${var.cdn_host}" },
    { "name": "CHS_URL", "value": "${var.chs_url}" },
    { "name": "COOKIE_DOMAIN", "value": "${var.cookie_domain}" },
    { "name": "COOKIE_NAME", "value": "${var.cookie_name}" },
    { "name": "COOKIE_SECURE_ONLY", "value": "${var.cookie_secure_only}" },
    { "name": "DEFAULT_SESSION_EXPIRATION", "value": "${var.default_session_expiration}" },
    { "name": "EWF_URL", "value": "${var.ewf_url}" },
    { "name": "FEATURE_FLAG_REMOVE_DIRECTOR_20022023", "value": "${var.feature_flag_remove_director_20022023}" },
    { "name": "LOGLEVEL", "value": "${var.log_level}" },
    { "name": "NODE_PORT", "value": "${local.container_port}" },
    { "name": "OFFICER_FILING_WEB_ACTIVE", "value": "${var.officer_filing_web_active}" },
    { "name": "PIWIK_SITE_ID", "value": "${var.piwik_site_id}" },
    { "name": "PIWIK_START_GOAL_ID", "value": "${var.piwik_start_goal_id}" },
    { "name": "PIWIK_URL", "value": "${var.piwik_url}" },
    { "name": "REDIRECT_URI", "value": "${var.redirect_uri}" },
    { "name": "SERVICE_NAME", "value": "${var.service_name}" },
    { "name": "SHOW_SERVICE_OFFLINE_PAGE", "value": "${var.show_service_offline_page}" },
    { "name": "TITLE_LIST", "value": "${var.title_list}" },
    { "name": "OCCUPATION_LIST", "value": "${var.occupation_list}" },
    { "name": "COUNTRY_LIST", "value": "${var.country_list}" },
    { "name": "UK_COUNTRY_LIST", "value": "${var.uk_country_list}" },
    { "name": "NATIONALITY_LIST", "value": "${var.nationality_list}" },
    { "name": "POSTCODE_VALIDATION_URL", "value": "${var.postcode_validation_url}" },
    { "name": "POSTCODE_ADDRESSES_LOOKUP_URL", "value": "${var.postcode_address_lookup_url}" }
  ]
}
