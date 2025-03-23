#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { QueueStack } from '../lib/queue-stack';

const servicePrefix = 'PolicyAttachmentSample';

const env = {
  account: process.env.CDK_ACCOUNT,
  region: process.env.CDK_REGION
}

const app = new cdk.App();
new QueueStack(app, `${servicePrefix}QueueStack`, { env });