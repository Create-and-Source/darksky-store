variable "project" {
  description = "Project name prefix for all resources"
  type        = string
  default     = "darksky"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "prod"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "aws_profile" {
  description = "AWS CLI profile name"
  type        = string
  default     = "default"
}

variable "cors_origins" {
  description = "Allowed CORS origins for API Gateway"
  type        = list(string)
  default = [
    "http://localhost:5173",
    "https://darkskycenter.org",
    "https://www.darkskycenter.org",
  ]
}

variable "domain_name" {
  description = "Primary domain name for the site"
  type        = string
  default     = "darkskycenter.org"
}

variable "lambda_memory_mb" {
  description = "Lambda memory in MB"
  type        = number
  default     = 256
}

variable "lambda_timeout_sec" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 10
}
