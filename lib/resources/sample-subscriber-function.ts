import { Construct } from "constructs";
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as log from 'aws-cdk-lib/aws-logs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export const generateSampleSubscriberFunction = (scope: Construct, id: string, queue: sqs.Queue) => {
    const subscriberFunction = new nodeLambda.NodejsFunction(scope, 'SampleSubscriberFunction', {
        functionName: `${id}SampleSubscriberFunction`,
        runtime: lambda.Runtime.NODEJS_LATEST,
        handler: 'handler',
        entry: 'lambda/sample-subscriber.ts',
        timeout: cdk.Duration.seconds(10)
    });

    new log.LogGroup(scope, 'SampleSubscriberFunctionLogGroup', {
        logGroupName: `/aws/lambda/${subscriberFunction.functionName}`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        retention: log.RetentionDays.FIVE_DAYS
    })

    // Add the SQS event source to the Lambda function
    subscriberFunction.addEventSource(new SqsEventSource(queue, {
        batchSize: 10, // batch 10 messages at a time
        reportBatchItemFailures: true
    }));

    return subscriberFunction;
}