import { Construct } from "constructs";
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as log from 'aws-cdk-lib/aws-logs';
import * as sqs from 'aws-cdk-lib/aws-sqs';

import { attachServicePrefix } from "../../util/attach-service-prefix";

export const generatePublisherFunction = (scope: Construct, queue: sqs.Queue): lambda.Function => {
    const publisherFunction = new nodeLambda.NodejsFunction(scope, 'PublisherFunction', {
        functionName: attachServicePrefix('PublisherFunction'),
        runtime: lambda.Runtime.NODEJS_LATEST,
        handler: 'handler',
        entry: 'lambda/publisher.ts',
        timeout: cdk.Duration.seconds(10),
        environment: {
            BUCKET_NAME: attachServicePrefix('event-source-bucket', true),
            QUEUE_URL: queue.queueUrl,
        }
    });

    new log.LogGroup(scope, 'PublisherFunctionLogGroup', {
        logGroupName: `/aws/lambda/${publisherFunction.functionName}`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        retention: log.RetentionDays.FIVE_DAYS
    })

    return publisherFunction;
}