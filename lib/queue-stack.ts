import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { generateSampleSqs } from './resources/sample-sqs';
import { generateSampleSubscriberFunction } from './resources/sample-subscriber-function';

export class QueueStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const queue = generateSampleSqs(this, id);

    generateSampleSubscriberFunction(this, id, queue);
  }
}
