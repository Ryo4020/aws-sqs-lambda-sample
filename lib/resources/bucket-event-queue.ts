import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';

import { attachServicePrefix } from '../../util/attach-service-prefix';

export const generateBucketEventQueue = (scope: Construct) => {
    // Create a dead letter queue
    const deadLetterQueue = new sqs.Queue(scope, 'DeadLetterQueue', {
        queueName: attachServicePrefix('BucketEventQueueDeadLetterQueue'),
        visibilityTimeout: cdk.Duration.seconds(30),
    });

    const queue = new sqs.Queue(scope, 'BucketEventQueue', {
        queueName: attachServicePrefix('BucketEventQueue'),
        visibilityTimeout: cdk.Duration.seconds(30),
        deadLetterQueue: {
            maxReceiveCount: 2,
            queue: deadLetterQueue
        },
        receiveMessageWaitTime: cdk.Duration.seconds(10), // Long polling
        redriveAllowPolicy: {
            redrivePermission: sqs.RedrivePermission.DENY_ALL,
        },
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        retentionPeriod: cdk.Duration.days(2),
    });

    return queue;
}