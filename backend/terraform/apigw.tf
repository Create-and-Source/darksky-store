# ── API Gateway HTTP API ───────────────────────────────────────────────────────

locals {
  routes = {
    # Products
    "GET /api/products"                  = "products"
    "GET /api/products/{id}"             = "products"

    # Inventory
    "GET /api/inventory"                 = "inventory"
    "PUT /api/inventory/{id}"            = "inventory"
    "POST /api/inventory/adjust"         = "inventory"
    "POST /api/inventory/receive"        = "inventory"

    # Orders
    "GET /api/orders"                    = "orders"
    "GET /api/orders/{id}"               = "orders"
    "POST /api/orders"                   = "orders"
    "PUT /api/orders/{id}"               = "orders"

    # Events
    "GET /api/events"                    = "events"
    "GET /api/events/{id}"               = "events"
    "POST /api/events"                   = "events"
    "PUT /api/events/{id}"               = "events"
    "DELETE /api/events/{id}"            = "events"

    # Reservations
    "GET /api/reservations"              = "reservations"
    "POST /api/reservations"             = "reservations"

    # Members
    "GET /api/members"                   = "members"
    "POST /api/members"                  = "members"
    "GET /api/members/check/{email}"     = "members"

    # Donations
    "GET /api/donations"                 = "donations"
    "GET /api/donations/{id}"            = "donations"
    "POST /api/donations"                = "donations"
    "PUT /api/donations/{id}"            = "donations"
    "DELETE /api/donations/{id}"         = "donations"

    # Volunteers
    "GET /api/volunteers"                = "volunteers"
    "GET /api/volunteers/{id}"           = "volunteers"
    "POST /api/volunteers"               = "volunteers"
    "PUT /api/volunteers/{id}"           = "volunteers"
    "DELETE /api/volunteers/{id}"        = "volunteers"

    # Staff
    "GET /api/staff"                     = "staff"
    "POST /api/staff/timesheet"          = "staff"
    "POST /api/staff/payroll"            = "staff"

    # Facility
    "GET /api/facility"                  = "facility"
    "GET /api/facility/{id}"             = "facility"
    "POST /api/facility"                 = "facility"
    "PUT /api/facility/{id}"             = "facility"
    "DELETE /api/facility/{id}"          = "facility"

    # Visitors
    "GET /api/visitors"                  = "visitors"
    "POST /api/visitors"                 = "visitors"
    "PUT /api/visitors/{date}"           = "visitors"

    # Emails
    "GET /api/emails"                    = "emails"
    "POST /api/emails"                   = "emails"

    # Contacts
    "GET /api/contacts"                  = "contacts"
    "POST /api/contacts"                 = "contacts"

    # Inquiries
    "GET /api/inquiries"                 = "inquiries"
    "POST /api/inquiries"                = "inquiries"

    # Transfers
    "GET /api/transfers"                 = "transfers"
    "POST /api/transfers"                = "transfers"
    "PUT /api/transfers/{id}"            = "transfers"

    # Purchase Orders
    "GET /api/purchase-orders"           = "purchase-orders"
    "GET /api/purchase-orders/{id}"      = "purchase-orders"
    "POST /api/purchase-orders"          = "purchase-orders"
    "PUT /api/purchase-orders/{id}"      = "purchase-orders"
    "DELETE /api/purchase-orders/{id}"   = "purchase-orders"

    # Cart
    "GET /api/cart"                      = "cart"
    "POST /api/cart"                     = "cart"
    "PUT /api/cart/{id}"                 = "cart"
    "DELETE /api/cart/{id}"              = "cart"
    "DELETE /api/cart"                   = "cart"

    # Content
    "GET /api/content"                   = "content"
    "PUT /api/content/{page}"            = "content"

    # Announcement
    "GET /api/announcement"              = "announcement"
    "PUT /api/announcement"              = "announcement"

    # Fundraising
    "GET /api/fundraising"               = "fundraising"
    "PUT /api/fundraising"               = "fundraising"

    # Analytics
    "GET /api/analytics/dashboard"       = "analytics"
    "GET /api/analytics/velocity"        = "analytics"
    "GET /api/analytics/reorder"         = "analytics"

    # Field Trips
    "GET /api/field-trips"               = "field-trips"
    "POST /api/field-trips"              = "field-trips"
    "PUT /api/field-trips/{id}"          = "field-trips"
    "DELETE /api/field-trips/{id}"       = "field-trips"

    # Messages
    "GET /api/messages"                  = "messages"
    "POST /api/messages"                 = "messages"

    # Held Sales
    "GET /api/held-sales"                = "held-sales"
    "POST /api/held-sales"               = "held-sales"
    "DELETE /api/held-sales/{id}"        = "held-sales"
  }
}

resource "aws_apigatewayv2_api" "main" {
  name          = "${local.prefix}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = var.cors_origins
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true
}

# ── Integrations (one per Lambda) ─────────────────────────────────────────────

resource "aws_apigatewayv2_integration" "functions" {
  for_each = local.lambda_folders

  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.functions[each.key].invoke_arn
  payload_format_version = "2.0"
}

# ── Routes (one per route entry) ──────────────────────────────────────────────

resource "aws_apigatewayv2_route" "routes" {
  for_each = local.routes

  api_id             = aws_apigatewayv2_api.main.id
  route_key          = each.key
  target             = "integrations/${aws_apigatewayv2_integration.functions[each.value].id}"
  authorization_type = "NONE"
}

# ── Lambda invoke permissions ──────────────────────────────────────────────────

resource "aws_lambda_permission" "apigw" {
  for_each = local.lambda_folders

  statement_id  = "AllowAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.functions[each.key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
