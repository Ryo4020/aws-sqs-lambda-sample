import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

import { generateEventSourceBucket } from './resources/event-source-bucket';
import { generateBucketEventQueue } from './resources/bucket-event-queue';
import { generatePublisherFunction } from './resources/publisher-function';
import { generateSubscriberFunction } from './resources/subscriber-function';
import { generateDataTable } from './resources/data-table';
import { generateTimestampTable } from './resources/timestamp-table';

export class QueueSystemStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = generateEventSourceBucket(this);

    const queue = generateBucketEventQueue(this);

    const publisher = generatePublisherFunction(this, queue);
    const subscriber = generateSubscriberFunction(this);

    const dataTable = generateDataTable(this);
    const timestampTable = generateTimestampTable(this);

    // Add the policies to the Lambda function
    this.addBucketGetPolicyToPublisher(bucket, publisher);
    this.addSendQueueMessagePolicyToPublisher(queue, publisher);

    // Add the S3 event source to the Lambda function
    this.addBucketEventNotificationToPublisher(bucket, publisher);

    // Add the SQS event source to the Lambda function
    this.addQueueEventSourceToSubscriber(queue, subscriber);

    // Add the table policy to the Lambda function
    this.addTablePolicyToSubscriber(subscriber, dataTable);
    this.addTablePolicyToSubscriber(subscriber, timestampTable);
  }

  private addBucketGetPolicyToPublisher(bucket: s3.Bucket, publisher: lambda.Function, ) {
    bucket.grantRead(publisher);
  }

  private addBucketEventNotificationToPublisher(bucket: s3.Bucket, publisher: lambda.Function) {
    bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new LambdaDestination(publisher), {
      suffix: '.csv'
    });
    bucket.addEventNotification(s3.EventType.OBJECT_REMOVED, new LambdaDestination(publisher), {
      suffix: '.csv'
    });
  }

  private addSendQueueMessagePolicyToPublisher(queue: sqs.Queue, publisher: lambda.Function) {
    queue.grantSendMessages(publisher);
  }

  private addQueueEventSourceToSubscriber(queue: sqs.Queue, subscriber: lambda.Function) {
    subscriber.addEventSource(new SqsEventSource(queue, {
      batchSize: 10, // batch 10 messages at a time
      reportBatchItemFailures: true
    }));
  }

  private addTablePolicyToSubscriber(subscriber: lambda.Function, table: dynamodb.TableV2) {
    table.grantReadWriteData(subscriber);
  }
}
