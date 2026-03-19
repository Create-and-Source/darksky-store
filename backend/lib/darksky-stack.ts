import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as path from 'path';

// ── Table definitions ──────────────────────────────────────────────
// Each maps to a localStorage key from the frontend
const TABLES: { name: string; pk: string; sk?: string; gsi?: { name: string; pk: string; sk?: string }[] }[] = [
  { name: 'products', pk: 'id' },
  { name: 'inventory', pk: 'id', gsi: [{ name: 'bySku', pk: 'sku' }] },
  { name: 'orders', pk: 'id', gsi: [{ name: 'byStatus', pk: 'status', sk: 'createdAt' }, { name: 'byCustomer', pk: 'customerEmail', sk: 'createdAt' }] },
  { name: 'purchase_orders', pk: 'id', gsi: [{ name: 'byVendor', pk: 'vendor', sk: 'createdAt' }] },
  { name: 'transfers', pk: 'id' },
  { name: 'events', pk: 'id', gsi: [{ name: 'byStatus', pk: 'status', sk: 'date' }] },
  { name: 'reservations', pk: 'id', gsi: [{ name: 'byEvent', pk: 'eventId' }] },
  { name: 'emails', pk: 'id' },
  { name: 'content', pk: 'page' },
  { name: 'cart', pk: 'id' },
  { name: 'members', pk: 'id', gsi: [{ name: 'byEmail', pk: 'email' }] },
  { name: 'inquiries', pk: 'id' },
  { name: 'contacts', pk: 'id', gsi: [{ name: 'byEmail', pk: 'email' }] },
  { name: 'announcement', pk: 'id' },
  { name: 'movement_history', pk: 'productId', sk: 'timestamp' },
  { name: 'donations', pk: 'id', gsi: [{ name: 'byCampaign', pk: 'campaign', sk: 'createdAt' }] },
  { name: 'facility_bookings', pk: 'id', gsi: [{ name: 'bySpace', pk: 'space', sk: 'date' }] },
  { name: 'visitors', pk: 'date' },
  { name: 'volunteers', pk: 'id' },
  { name: 'fundraising', pk: 'id' },
  { name: 'staff', pk: 'id' },
  { name: 'timesheets', pk: 'id' },
  { name: 'payroll_history', pk: 'id' },
  { name: 'field_trips', pk: 'id' },
  { name: 'messages', pk: 'id' },
  { name: 'held_sales', pk: 'id' },
];

// ── Lambda route definitions ───────────────────────────────────────
// Each entry: [HTTP method, path, lambda folder name, tables it needs access to]
const ROUTES: [string, string, string, string[]][] = [
  // Products
  ['GET',    '/api/products',           'products',         ['products']],
  ['GET',    '/api/products/{id}',      'products',         ['products']],
  // Inventory
  ['GET',    '/api/inventory',          'inventory',        ['inventory', 'movement_history']],
  ['PUT',    '/api/inventory/{id}',     'inventory',        ['inventory']],
  ['POST',   '/api/inventory/adjust',   'inventory',        ['inventory', 'movement_history']],
  ['POST',   '/api/inventory/receive',  'inventory',        ['inventory', 'movement_history']],
  // Orders
  ['GET',    '/api/orders',             'orders',           ['orders']],
  ['GET',    '/api/orders/{id}',        'orders',           ['orders']],
  ['POST',   '/api/orders',             'orders',           ['orders', 'inventory', 'movement_history']],
  ['PUT',    '/api/orders/{id}',        'orders',           ['orders']],
  // Events
  ['GET',    '/api/events',             'events',           ['events']],
  ['GET',    '/api/events/{id}',        'events',           ['events']],
  ['POST',   '/api/events',             'events',           ['events']],
  ['PUT',    '/api/events/{id}',        'events',           ['events']],
  ['DELETE', '/api/events/{id}',        'events',           ['events']],
  // Reservations
  ['GET',    '/api/reservations',       'reservations',     ['reservations']],
  ['POST',   '/api/reservations',       'reservations',     ['reservations', 'events']],
  // Members
  ['GET',    '/api/members',            'members',          ['members']],
  ['POST',   '/api/members',            'members',          ['members']],
  ['GET',    '/api/members/check/{email}', 'members',       ['members']],
  // Donations
  ['GET',    '/api/donations',          'donations',        ['donations', 'fundraising']],
  ['GET',    '/api/donations/{id}',     'donations',        ['donations']],
  ['POST',   '/api/donations',          'donations',        ['donations', 'fundraising']],
  ['PUT',    '/api/donations/{id}',     'donations',        ['donations']],
  ['DELETE', '/api/donations/{id}',     'donations',        ['donations']],
  // Volunteers
  ['GET',    '/api/volunteers',         'volunteers',       ['volunteers']],
  ['GET',    '/api/volunteers/{id}',    'volunteers',       ['volunteers']],
  ['POST',   '/api/volunteers',         'volunteers',       ['volunteers']],
  ['PUT',    '/api/volunteers/{id}',    'volunteers',       ['volunteers']],
  ['DELETE', '/api/volunteers/{id}',    'volunteers',       ['volunteers']],
  // Staff & Payroll
  ['GET',    '/api/staff',              'staff',            ['staff', 'timesheets', 'payroll_history']],
  ['POST',   '/api/staff/timesheet',    'staff',            ['timesheets']],
  ['POST',   '/api/staff/payroll',      'staff',            ['payroll_history']],
  // Facility Bookings
  ['GET',    '/api/facility',           'facility',         ['facility_bookings']],
  ['GET',    '/api/facility/{id}',      'facility',         ['facility_bookings']],
  ['POST',   '/api/facility',           'facility',         ['facility_bookings']],
  ['PUT',    '/api/facility/{id}',      'facility',         ['facility_bookings']],
  ['DELETE', '/api/facility/{id}',      'facility',         ['facility_bookings']],
  // Visitors
  ['GET',    '/api/visitors',           'visitors',         ['visitors']],
  ['POST',   '/api/visitors',           'visitors',         ['visitors']],
  ['PUT',    '/api/visitors/{date}',    'visitors',         ['visitors']],
  // Emails
  ['GET',    '/api/emails',             'emails',           ['emails']],
  ['POST',   '/api/emails',             'emails',           ['emails']],
  // Contacts & Inquiries
  ['GET',    '/api/contacts',           'contacts',         ['contacts']],
  ['POST',   '/api/contacts',           'contacts',         ['contacts']],
  ['GET',    '/api/inquiries',          'inquiries',        ['inquiries']],
  ['POST',   '/api/inquiries',          'inquiries',        ['inquiries']],
  // Transfers
  ['GET',    '/api/transfers',          'transfers',        ['transfers']],
  ['POST',   '/api/transfers',          'transfers',        ['transfers']],
  ['PUT',    '/api/transfers/{id}',     'transfers',        ['transfers']],
  // Purchase Orders
  ['GET',    '/api/purchase-orders',         'purchase-orders', ['purchase_orders']],
  ['GET',    '/api/purchase-orders/{id}',    'purchase-orders', ['purchase_orders']],
  ['POST',   '/api/purchase-orders',         'purchase-orders', ['purchase_orders']],
  ['PUT',    '/api/purchase-orders/{id}',    'purchase-orders', ['purchase_orders']],
  ['DELETE', '/api/purchase-orders/{id}',    'purchase-orders', ['purchase_orders']],
  // Cart (POS)
  ['GET',    '/api/cart',               'cart',             ['cart']],
  ['POST',   '/api/cart',               'cart',             ['cart']],
  ['PUT',    '/api/cart/{id}',          'cart',             ['cart']],
  ['DELETE', '/api/cart/{id}',          'cart',             ['cart']],
  ['DELETE', '/api/cart',               'cart',             ['cart']],
  // Content & Announcement
  ['GET',    '/api/content',            'content',          ['content']],
  ['PUT',    '/api/content/{page}',     'content',          ['content']],
  ['GET',    '/api/announcement',       'announcement',     ['announcement']],
  ['PUT',    '/api/announcement',       'announcement',     ['announcement']],
  // Fundraising
  ['GET',    '/api/fundraising',        'fundraising',      ['fundraising']],
  ['PUT',    '/api/fundraising',        'fundraising',      ['fundraising']],
  // Analytics
  ['GET',    '/api/analytics/dashboard','analytics',        ['orders', 'inventory', 'events', 'members', 'donations', 'visitors']],
  ['GET',    '/api/analytics/velocity', 'analytics',        ['orders', 'inventory']],
  ['GET',    '/api/analytics/reorder',  'analytics',        ['inventory']],
  // Field Trips
  ['GET',    '/api/field-trips',        'field-trips',      ['field_trips']],
  ['POST',   '/api/field-trips',        'field-trips',      ['field_trips']],
  ['PUT',    '/api/field-trips/{id}',   'field-trips',      ['field_trips']],
  ['DELETE', '/api/field-trips/{id}',   'field-trips',      ['field_trips']],
  // Messages
  ['GET',    '/api/messages',           'messages',         ['messages']],
  ['POST',   '/api/messages',           'messages',         ['messages']],
  // Held Sales
  ['GET',    '/api/held-sales',         'held-sales',       ['held_sales']],
  ['POST',   '/api/held-sales',         'held-sales',       ['held_sales']],
  ['DELETE', '/api/held-sales/{id}',    'held-sales',       ['held_sales']],
];

export class DarkskyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ── S3 bucket for uploads ────────────────────────────────────
    const uploadsBucket = new s3.Bucket(this, 'UploadsBucket', {
      bucketName: `darksky-uploads-${this.account}`,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
        maxAge: 3600,
      }],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // ── Cognito User Pool ────────────────────────────────────────
    const userPool = new cognito.UserPool(this, 'DarkskyUserPool', {
      userPoolName: 'darksky-users',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        fullname: { required: true, mutable: true },
      },
      customAttributes: {
        role: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const userPoolClient = userPool.addClient('DarkskyWebClient', {
      userPoolClientName: 'darksky-web',
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
        callbackUrls: ['http://localhost:5173/auth/callback', 'https://darkskycenter.org/auth/callback'],
        logoutUrls: ['http://localhost:5173', 'https://darkskycenter.org'],
      },
    });

    // Admin, staff, and customer groups
    for (const group of ['admin', 'shop_manager', 'shop_staff', 'reports', 'member', 'volunteer']) {
      new cognito.CfnUserPoolGroup(this, `Group-${group}`, {
        userPoolId: userPool.userPoolId,
        groupName: group,
        description: `${group} role`,
      });
    }

    // ── DynamoDB Tables ──────────────────────────────────────────
    const tables: Record<string, dynamodb.Table> = {};

    for (const def of TABLES) {
      const table = new dynamodb.Table(this, `Table-${def.name}`, {
        tableName: `darksky-${def.name}`,
        partitionKey: { name: def.pk, type: dynamodb.AttributeType.STRING },
        ...(def.sk ? { sortKey: { name: def.sk, type: dynamodb.AttributeType.STRING } } : {}),
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      });

      if (def.gsi) {
        for (const gsi of def.gsi) {
          table.addGlobalSecondaryIndex({
            indexName: gsi.name,
            partitionKey: { name: gsi.pk, type: dynamodb.AttributeType.STRING },
            ...(gsi.sk ? { sortKey: { name: gsi.sk, type: dynamodb.AttributeType.STRING } } : {}),
            projectionType: dynamodb.ProjectionType.ALL,
          });
        }
      }

      tables[def.name] = table;
    }

    // ── API Gateway HTTP API ─────────────────────────────────────
    const api = new apigw.HttpApi(this, 'DarkskyApi', {
      apiName: 'darksky-api',
      corsPreflight: {
        allowOrigins: ['http://localhost:5173', 'https://darkskycenter.org'],
        allowMethods: [apigw.CorsHttpMethod.ANY],
        allowHeaders: ['Content-Type', 'Authorization'],
        maxAge: cdk.Duration.hours(1),
      },
    });

    // ── Lambda Functions ─────────────────────────────────────────
    // Deduplicate: one Lambda per folder, multiple routes point to it
    const lambdaCache: Record<string, lambda.Function> = {};
    const lambdaDir = path.join(__dirname, '..', 'lambda');

    // Shared layer with DynamoDB helpers
    const sharedLayer = new lambda.LayerVersion(this, 'SharedLayer', {
      code: lambda.Code.fromAsset(path.join(lambdaDir, 'shared')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: 'Shared DynamoDB helpers and response utilities',
    });

    for (const [method, routePath, folder, tableNames] of ROUTES) {
      // Create Lambda if not already cached
      if (!lambdaCache[folder]) {
        const fn = new lambda.Function(this, `Fn-${folder}`, {
          functionName: `darksky-${folder}`,
          runtime: lambda.Runtime.NODEJS_20_X,
          handler: 'index.handler',
          code: lambda.Code.fromAsset(path.join(lambdaDir, folder)),
          layers: [sharedLayer],
          memorySize: 256,
          timeout: cdk.Duration.seconds(10),
          environment: {
            TABLE_PREFIX: 'darksky-',
            UPLOADS_BUCKET: uploadsBucket.bucketName,
            USER_POOL_ID: userPool.userPoolId,
          },
        });

        uploadsBucket.grantReadWrite(fn);
        lambdaCache[folder] = fn;
      }

      // Grant DynamoDB access for required tables
      for (const tableName of tableNames) {
        if (tables[tableName]) {
          tables[tableName].grantReadWriteData(lambdaCache[folder]);
        }
      }

      // Add route
      const httpMethod = apigw.HttpMethod[method as keyof typeof apigw.HttpMethod];
      api.addRoutes({
        path: routePath,
        methods: [httpMethod],
        integration: new integrations.HttpLambdaIntegration(
          `${method}-${routePath.replace(/[/{}]/g, '-')}`,
          lambdaCache[folder]
        ),
      });
    }

    // ── Outputs ──────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.apiEndpoint,
      description: 'API Gateway endpoint URL',
    });
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });
    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });
    new cdk.CfnOutput(this, 'UploadsBucketName', {
      value: uploadsBucket.bucketName,
      description: 'S3 uploads bucket',
    });
  }
}
