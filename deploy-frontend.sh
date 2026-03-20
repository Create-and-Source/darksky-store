#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# deploy-frontend.sh — Build and deploy Dark Sky frontend to AWS
# Usage:  bash deploy-frontend.sh
# ─────────────────────────────────────────────────────────────────
set -e

PROFILE="darksky"
REGION="us-west-2"
TF_DIR="backend/terraform"

echo "▶ Reading Terraform outputs..."
BUCKET=$(aws --profile "$PROFILE" --region "$REGION" \
  s3api list-buckets \
  --query "Buckets[?contains(Name, 'darksky-prod-frontend')].Name | [0]" \
  --output text)

CF_ID=$(terraform -chdir="$TF_DIR" output -raw cloudfront_distribution_id 2>/dev/null || echo "")

if [ -z "$BUCKET" ] || [ "$BUCKET" = "None" ]; then
  echo "✗ Frontend S3 bucket not found."
  echo "  Run: cd $TF_DIR && terraform apply"
  exit 1
fi

echo "  Bucket : $BUCKET"
echo "  CF ID  : ${CF_ID:-'(not found — skipping invalidation)'}"

echo ""
echo "▶ Building frontend..."
npm run build

echo ""
echo "▶ Syncing dist/ → s3://$BUCKET ..."
aws s3 sync dist/ "s3://$BUCKET" \
  --profile "$PROFILE" \
  --region "$REGION" \
  --delete \
  --cache-control "public, max-age=0, must-revalidate" \
  --exclude "assets/*"

# Assets have content-hashed filenames — cache them long-term
aws s3 sync dist/assets/ "s3://$BUCKET/assets/" \
  --profile "$PROFILE" \
  --region "$REGION" \
  --cache-control "public, max-age=31536000, immutable"

echo "  ✓ Upload complete"

if [ -n "$CF_ID" ] && [ "$CF_ID" != "null" ]; then
  echo ""
  echo "▶ Invalidating CloudFront cache ($CF_ID)..."
  INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --profile "$PROFILE" \
    --distribution-id "$CF_ID" \
    --paths "/*" \
    --query "Invalidation.Id" \
    --output text)
  echo "  ✓ Invalidation $INVALIDATION_ID created (takes ~30s to propagate)"
fi

echo ""
CF_URL=$(terraform -chdir="$TF_DIR" output -raw cloudfront_url 2>/dev/null || echo "(run terraform output cloudfront_url)")
echo "✓ Deployed to: $CF_URL"
