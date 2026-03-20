# ── DynamoDB Tables ───────────────────────────────────────────────────────────
# 26 tables — all PAY_PER_REQUEST, all with PITR enabled.
# Table names: darksky-prod-{name}  (e.g. darksky-prod-orders)
# Lambda functions reference tables via TABLE_PREFIX env var: "darksky-prod-"

locals {
  dynamodb_tables = {

    # ── Gift Shop ──────────────────────────────────────────────────
    products = {
      hash_key  = "id"
      range_key = null
      attrs     = [{ name = "id", type = "S" }]
      gsis      = []
    }

    inventory = {
      hash_key  = "id"
      range_key = null
      attrs = [
        { name = "id",  type = "S" },
        { name = "sku", type = "S" },
      ]
      gsis = [
        { name = "bySku", hash_key = "sku", range_key = null },
      ]
    }

    orders = {
      hash_key  = "id"
      range_key = null
      attrs = [
        { name = "id",            type = "S" },
        { name = "status",        type = "S" },
        { name = "createdAt",     type = "S" },
        { name = "customerEmail", type = "S" },
      ]
      gsis = [
        { name = "byStatus",   hash_key = "status",        range_key = "createdAt" },
        { name = "byCustomer", hash_key = "customerEmail", range_key = "createdAt" },
      ]
    }

    purchase_orders = {
      hash_key  = "id"
      range_key = null
      attrs = [
        { name = "id",        type = "S" },
        { name = "vendor",    type = "S" },
        { name = "createdAt", type = "S" },
      ]
      gsis = [
        { name = "byVendor", hash_key = "vendor", range_key = "createdAt" },
      ]
    }

    transfers = {
      hash_key  = "id"
      range_key = null
      attrs     = [{ name = "id", type = "S" }]
      gsis      = []
    }

    cart = {
      hash_key  = "id"
      range_key = null
      attrs     = [{ name = "id", type = "S" }]
      gsis      = []
    }

    movement_history = {
      hash_key  = "productId"
      range_key = "timestamp"
      attrs = [
        { name = "productId", type = "S" },
        { name = "timestamp", type = "S" },
      ]
      gsis = []
    }

    held_sales = {
      hash_key  = "id"
      range_key = null
      attrs     = [{ name = "id", type = "S" }]
      gsis      = []
    }

    # ── Programs & Events ──────────────────────────────────────────
    events = {
      hash_key  = "id"
      range_key = null
      attrs = [
        { name = "id",     type = "S" },
        { name = "status", type = "S" },
        { name = "date",   type = "S" },
      ]
      gsis = [
        { name = "byStatus", hash_key = "status", range_key = "date" },
      ]
    }

    reservations = {
      hash_key  = "id"
      range_key = null
      attrs = [
        { name = "id",      type = "S" },
        { name = "eventId", type = "S" },
      ]
      gsis = [
        { name = "byEvent", hash_key = "eventId", range_key = null },
      ]
    }

    field_trips = {
      hash_key  = "id"
      range_key = null
      attrs     = [{ name = "id", type = "S" }]
      gsis      = []
    }

    # ── Community ──────────────────────────────────────────────────
    donations = {
      hash_key  = "id"
      range_key = null
      attrs = [
        { name = "id",        type = "S" },
        { name = "campaign",  type = "S" },
        { name = "createdAt", type = "S" },
      ]
      gsis = [
        { name = "byCampaign", hash_key = "campaign", range_key = "createdAt" },
      ]
    }

    fundraising = {
      hash_key  = "id"
      range_key = null
      attrs     = [{ name = "id", type = "S" }]
      gsis      = []
    }

    members = {
      hash_key  = "id"
      range_key = null
      attrs = [
        { name = "id",    type = "S" },
        { name = "email", type = "S" },
      ]
      gsis = [
        { name = "byEmail", hash_key = "email", range_key = null },
      ]
    }

    volunteers = {
      hash_key  = "id"
      range_key = null
      attrs     = [{ name = "id", type = "S" }]
      gsis      = []
    }

    # ── Facility & Visitors ────────────────────────────────────────
    facility_bookings = {
      hash_key  = "id"
      range_key = null
      attrs = [
        { name = "id",    type = "S" },
        { name = "space", type = "S" },
        { name = "date",  type = "S" },
      ]
      gsis = [
        { name = "bySpace", hash_key = "space", range_key = "date" },
      ]
    }

    visitors = {
      hash_key  = "date"
      range_key = null
      attrs     = [{ name = "date", type = "S" }]
      gsis      = []
    }

    # ── Staff & Payroll ────────────────────────────────────────────
    staff = {
      hash_key  = "id"
      range_key = null
      attrs     = [{ name = "id", type = "S" }]
      gsis      = []
    }

    timesheets = {
      hash_key  = "id"
      range_key = null
      attrs     = [{ name = "id", type = "S" }]
      gsis      = []
    }

    payroll_history = {
      hash_key  = "id"
      range_key = null
      attrs     = [{ name = "id", type = "S" }]
      gsis      = []
    }

    # ── Communications ─────────────────────────────────────────────
    emails = {
      hash_key  = "id"
      range_key = null
      attrs     = [{ name = "id", type = "S" }]
      gsis      = []
    }

    messages = {
      hash_key  = "id"
      range_key = null
      attrs     = [{ name = "id", type = "S" }]
      gsis      = []
    }

    contacts = {
      hash_key  = "id"
      range_key = null
      attrs = [
        { name = "id",    type = "S" },
        { name = "email", type = "S" },
      ]
      gsis = [
        { name = "byEmail", hash_key = "email", range_key = null },
      ]
    }

    inquiries = {
      hash_key  = "id"
      range_key = null
      attrs     = [{ name = "id", type = "S" }]
      gsis      = []
    }

    announcement = {
      hash_key  = "id"
      range_key = null
      attrs     = [{ name = "id", type = "S" }]
      gsis      = []
    }

    # ── CMS Content ────────────────────────────────────────────────
    content = {
      hash_key  = "page"
      range_key = null
      attrs     = [{ name = "page", type = "S" }]
      gsis      = []
    }

  }
}

resource "aws_dynamodb_table" "tables" {
  for_each = local.dynamodb_tables

  name         = "${local.prefix}-${each.key}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = each.value.hash_key
  range_key    = each.value.range_key

  dynamic "attribute" {
    for_each = each.value.attrs
    content {
      name = attribute.value.name
      type = attribute.value.type
    }
  }

  dynamic "global_secondary_index" {
    for_each = each.value.gsis
    content {
      name            = global_secondary_index.value.name
      hash_key        = global_secondary_index.value.hash_key
      range_key       = global_secondary_index.value.range_key
      projection_type = "ALL"
    }
  }

  point_in_time_recovery {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}
