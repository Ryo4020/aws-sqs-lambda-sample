import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export const generateSampleSqs = (scope: Construct) => {
    const queue = new sqs.Queue(scope, 'SampleQueue', {
        queueName: 'SampleQueue',
        visibilityTimeout: cdk.Duration.seconds(300),
    });

    return queue;
}