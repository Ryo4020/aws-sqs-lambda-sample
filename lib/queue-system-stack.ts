import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { SqsDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

import { generateEventSourceBucket } from './resources/event-source-bucket';
import { generateBucketEventQueue } from './resources/bucket-event-queue';
import { generateSubscriberFunction } from './resources/subscriber-function';
import { generateDataTable } from './resources/data-table';
import { generateTimestampTable } from './resources/timestamp-table';

export class QueueSystemStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = generateEventSourceBucket(this);

    const queue = generateBucketEventQueue(this);

    const subscriber = generateSubscriberFunction(this);

    const dataTable = generateDataTable(this);
    const timestampTable = generateTimestampTable(this);

    // Add the S3 event source to the SQS queue
    this.addBucketEventNotificationToQueue(bucket, queue);

    // Add the SQS event source to the Lambda function
    this.addQueueEventSourceToSubscriber(queue, subscriber);

    // Add the table policy to the Lambda function
    this.addTablePolicyToSubscriber(subscriber, dataTable);
    this.addTablePolicyToSubscriber(subscriber, timestampTable);
  }

  private addBucketEventNotificationToQueue(bucket: s3.Bucket, queue: sqs.Queue) {
    bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new SqsDestination(queue), {
      suffix: '.csv'
    });
    bucket.addEventNotification(s3.EventType.OBJECT_REMOVED, new SqsDestination(queue), {
      suffix: '.csv'
    });
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
