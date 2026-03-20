# ── Lambda Layer (shared utilities) ───────────────────────────────────────────

locals {
  lambda_folders = toset([
    "analytics",
    "announcement",
    "cart",
    "contacts",
    "content",
    "donations",
    "emails",
    "events",
    "facility",
    "field-trips",
    "fundraising",
    "held-sales",
    "inquiries",
    "inventory",
    "members",
    "messages",
    "orders",
    "products",
    "purchase-orders",
    "reservations",
    "staff",
    "transfers",
    "visitors",
    "volunteers",
  ])
}

data "archive_file" "layer" {
  type        = "zip"
  source_dir  = "${local.lambda_dir}/shared"
  output_path = "${local.build_dir}/layer.zip"
}

resource "aws_lambda_layer_version" "shared" {
  layer_name          = "${local.prefix}-shared"
  filename            = data.archive_file.layer.output_path
  source_code_hash    = data.archive_file.layer.output_base64sha256
  compatible_runtimes = ["nodejs20.x"]
}

# ── Lambda Functions ───────────────────────────────────────────────────────────

data "archive_file" "lambdas" {
  for_each    = local.lambda_folders
  type        = "zip"
  source_dir  = "${local.lambda_dir}/${each.key}"
  output_path = "${local.build_dir}/${each.key}.zip"
}

resource "aws_lambda_function" "functions" {
  for_each = local.lambda_folders

  function_name    = "${local.prefix}-${each.key}"
  filename         = data.archive_file.lambdas[each.key].output_path
  source_code_hash = data.archive_file.lambdas[each.key].output_base64sha256
  role             = aws_iam_role.lambda.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  memory_size      = var.lambda_memory_mb
  timeout          = var.lambda_timeout_sec

  layers = [aws_lambda_layer_version.shared.arn]

  environment {
    variables = {
      TABLE_PREFIX   = "${local.prefix}-"
      UPLOADS_BUCKET = aws_s3_bucket.uploads.id
    }
  }
}
