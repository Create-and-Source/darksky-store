output "api_endpoint" {
  description = "API Gateway invoke URL"
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  description = "Cognito User Pool web client ID"
  value       = aws_cognito_user_pool_client.web.id
}

output "s3_bucket" {
  description = "S3 media uploads bucket name"
  value       = aws_s3_bucket.uploads.id
}

output "region" {
  description = "AWS region"
  value       = var.region
}

output "nameservers" {
  description = "Route 53 nameservers — set these at your domain registrar"
  value       = aws_route53_zone.main.name_servers
}

output "frontend_bucket" {
  description = "S3 bucket name for frontend static files"
  value       = aws_s3_bucket.frontend.id
}

output "cloudfront_url" {
  description = "CloudFront distribution URL (your site's public address)"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (needed for cache invalidations on deploy)"
  value       = aws_cloudfront_distribution.frontend.id
}

output "frontend_config" {
  description = "JSON blob to paste into src/aws-config.json"
  value = jsonencode({
    apiEndpoint          = aws_apigatewayv2_api.main.api_endpoint
    cognitoUserPoolId    = aws_cognito_user_pool.main.id
    cognitoClientId      = aws_cognito_user_pool_client.web.id
    s3Bucket             = aws_s3_bucket.uploads.id
    frontendBucket       = aws_s3_bucket.frontend.id
    cloudfrontUrl        = "https://${aws_cloudfront_distribution.frontend.domain_name}"
    cloudfrontId         = aws_cloudfront_distribution.frontend.id
    region               = var.region
  })
}
