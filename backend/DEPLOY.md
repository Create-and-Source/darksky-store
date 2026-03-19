# Dark Sky — AWS Backend Deployment

## Prerequisites

1. AWS CLI configured: `aws configure`
2. CDK bootstrapped: `cd backend && npx cdk bootstrap`
3. Node 20+

## Deploy

```bash
cd backend
npm install
npx cdk deploy
```

CDK outputs three values — copy them to your `.env`:

```
DarkskyStack.ApiUrl = https://abc123.execute-api.us-west-2.amazonaws.com
DarkskyStack.UserPoolId = us-west-2_XYZ
DarkskyStack.UserPoolClientId = abc123def456
```

## Seed Data

```bash
# Seed events, members, donations, volunteers, staff, facility, visitors
cd backend
AWS_REGION=us-west-2 node lambda/seed/run.js

# Seed products & inventory (from frontend source files)
AWS_REGION=us-west-2 node lambda/seed/seed-products.mjs
```

## Frontend Switch

To use the AWS backend instead of localStorage:

1. Copy `.env.example` to `.env` and fill in the CDK output values
2. In `src/App.jsx`, change:
   ```js
   // FROM:
   import { initStore } from './admin/data/store';
   // TO:
   import { initStore } from './api/client';
   ```
3. Update imports in any file that uses store functions:
   ```js
   // FROM:
   import { getOrders, addOrder } from '../admin/data/store';
   // TO:
   import { getOrders, addOrder } from '../api/client';
   ```

The API client exports identical function names, so no other code changes needed.

## Architecture

```
React SPA (Vercel)
  ↓ HTTPS
API Gateway HTTP API (CORS enabled)
  ↓ Lambda Integration
24 Lambda Functions (Node 20, 256MB, 10s timeout)
  ↓ DynamoDB Document Client
26 DynamoDB Tables (PAY_PER_REQUEST, point-in-time recovery)
  + Cognito User Pool (6 groups: admin, shop_manager, shop_staff, reports, member, volunteer)
  + S3 Bucket (uploads)
```

## Costs (estimated)

At gift-shop scale (~100 daily users, ~50 orders/day):

| Service | Monthly |
|---------|---------|
| DynamoDB | ~$1 (on-demand) |
| Lambda | ~$0 (free tier) |
| API Gateway | ~$1 |
| Cognito | ~$0 (first 50K MAU free) |
| S3 | ~$0.10 |
| **Total** | **~$2/month** |
