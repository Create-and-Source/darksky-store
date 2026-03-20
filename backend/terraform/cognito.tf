# ── Cognito User Pool ─────────────────────────────────────────────────────────

resource "aws_cognito_user_pool" "main" {
  name                     = "${local.prefix}-users"
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_uppercase                = true
    require_numbers                  = true
    require_symbols                  = false
    temporary_password_validity_days = 7
  }

  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true
    string_attribute_constraints {
      min_length = 0
      max_length = 256
    }
  }

  schema {
    name                = "name"
    attribute_data_type = "String"
    required            = true
    mutable             = true
    string_attribute_constraints {
      min_length = 0
      max_length = 256
    }
  }

  schema {
    name                = "role"
    attribute_data_type = "String"
    required            = false
    mutable             = true
    string_attribute_constraints {
      min_length = 0
      max_length = 256
    }
  }

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "${local.prefix}-web"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  supported_identity_providers         = ["COGNITO"]
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["openid", "email", "profile"]
  allowed_oauth_flows_user_pool_client = true

  callback_urls = [
    "http://localhost:5173/auth/callback",
    "https://darkskycenter.org/auth/callback",
  ]

  logout_urls = [
    "http://localhost:5173",
    "https://darkskycenter.org",
  ]

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  access_token_validity  = 24
  id_token_validity      = 24
  refresh_token_validity = 30
}

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${local.prefix}-auth"
  user_pool_id = aws_cognito_user_pool.main.id
}

# ── User Groups (roles) ───────────────────────────────────────────────────────

locals {
  cognito_groups = toset(["admin", "shop_manager", "shop_staff", "reports", "member", "volunteer"])
}

resource "aws_cognito_user_group" "groups" {
  for_each = local.cognito_groups

  name         = each.value
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "${each.value} role"
}
