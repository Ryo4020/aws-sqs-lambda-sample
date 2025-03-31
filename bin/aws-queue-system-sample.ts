#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { QueueSystemStack } from '../lib/queue-system-stack';
import { attachServicePrefix } from '../util/attach-service-prefix';

const env = {
  account: process.env.CDK_ACCOUNT,
  region: process.env.CDK_REGION
}

const app = new cdk.App();
new QueueSystemStack(app, attachServicePrefix('Stack'), { env });