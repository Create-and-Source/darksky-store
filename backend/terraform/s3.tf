# ── S3 Uploads Bucket ─────────────────────────────────────────────────────────

resource "aws_s3_bucket" "uploads" {
  bucket = "${local.prefix}-uploads-${local.account_id}"

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_s3_bucket_cors_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  cors_rule {
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = var.cors_origins
    allowed_headers = ["*"]
    max_age_seconds = 3600
  }
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
