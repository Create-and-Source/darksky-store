#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DarkskyStack } from '../lib/darksky-stack';

const app = new cdk.App();
new DarkskyStack(app, 'DarkskyStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-west-2',
  },
  description: 'Dark Sky Discovery Center — Gift Shop & Admin backend',
});
