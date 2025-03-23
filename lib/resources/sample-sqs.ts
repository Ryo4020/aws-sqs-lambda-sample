import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export const generateSampleSqs = (scope: Construct, id: string) => {
    // Create a dead letter queue
    const deadLetterQueue = new sqs.Queue(scope, 'DeadLetterQueue', {
        queueName: `${id}DeadLetterQueue.fifo`,
        fifo: true,
        visibilityTimeout: cdk.Duration.seconds(30),
    });

    const queue = new sqs.Queue(scope, 'SampleFifoQueue', {
        queueName: `${id}SampleQueue.fifo`,
        fifo: true,
        visibilityTimeout: cdk.Duration.seconds(30),
        deadLetterQueue: {
            maxReceiveCount: 2,
            queue: deadLetterQueue
        },
        contentBasedDeduplication: true,
        receiveMessageWaitTime: cdk.Duration.seconds(10), // Long polling
        redriveAllowPolicy: {
            redrivePermission: sqs.RedrivePermission.DENY_ALL,
        },
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        retentionPeriod: cdk.Duration.days(2),
    });

    return queue;
}