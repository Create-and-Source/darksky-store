# ── Frontend Hosting: S3 + CloudFront ─────────────────────────────────────────
# Static SPA hosting. CloudFront handles HTTPS, CDN, and SPA routing.
# The S3 bucket stays fully private — only CloudFront OAC can read it.

# ── S3 bucket for built frontend assets ──────────────────────────────────────

resource "aws_s3_bucket" "frontend" {
  bucket = "${local.prefix}-frontend-${local.account_id}"

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  versioning_configuration {
    status = "Enabled"
  }
}

# ── Origin Access Control (OAC) ───────────────────────────────────────────────

resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${local.prefix}-frontend-oac"
  description                       = "OAC for Dark Sky frontend S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ── CloudFront distribution ───────────────────────────────────────────────────

resource "aws_cloudfront_distribution" "frontend" {
  comment             = "${local.prefix} frontend"
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100" # US, Canada, Europe only — cheapest
  # aliases = [var.domain_name, "www.${var.domain_name}"] # uncomment when domain is ready

  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.frontend.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  default_cache_behavior {
    target_origin_id       = "S3-${aws_s3_bucket.frontend.id}"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    # HTML: short cache (bust on deploy via CloudFront invalidation)
    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 86400
  }

  # Hashed JS/CSS assets — cache aggressively (Vite fingerprints filenames)
  ordered_cache_behavior {
    path_pattern           = "/assets/*"
    target_origin_id       = "S3-${aws_s3_bucket.frontend.id}"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 86400
    default_ttl = 2592000  # 30 days
    max_ttl     = 31536000 # 1 year
  }

  # SPA routing: S3 returns 403 (private bucket) or 404 for unknown paths.
  # Both get rewritten to /index.html so React Router handles them.
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Using default CloudFront cert until domain nameservers are propagated.
  # When ready: uncomment aliases above, swap this block for the acm_certificate_arn block below.
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  # viewer_certificate {
  #   acm_certificate_arn      = aws_acm_certificate_validation.frontend.certificate_arn
  #   ssl_support_method       = "sni-only"
  #   minimum_protocol_version = "TLSv1.2_2021"
  # }

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

# ── S3 bucket policy: only CloudFront OAC can GetObject ──────────────────────

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontOAC"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn
          }
        }
      }
    ]
  })
}
