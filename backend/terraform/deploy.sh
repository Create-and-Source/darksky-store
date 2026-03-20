#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
mkdir -p .build
terraform init
terraform plan
terraform apply -auto-approve
echo "✓ Done. Run: terraform output -raw frontend_config"
