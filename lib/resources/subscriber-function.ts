import { Construct } from "constructs";
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as log from 'aws-cdk-lib/aws-logs';

import { attachServicePrefix } from "../../util/attach-service-prefix";

export const generateSubscriberFunction = (scope: Construct): lambda.Function => {
    const subscriberFunction = new nodeLambda.NodejsFunction(scope, 'SubscriberFunction', {
        functionName: attachServicePrefix('SubscriberFunction'),
        runtime: lambda.Runtime.NODEJS_LATEST,
        handler: 'handler',
        entry: 'lambda/subscriber.ts',
        timeout: cdk.Duration.seconds(10),
        environment: {
            BUCKET_NAME: attachServicePrefix('event-source-bucket', true),
            DATA_TABLE_NAME: attachServicePrefix('DataTable'),
            TIMESTAMP_TABLE_NAME: attachServicePrefix('TimestampTable'),
        }
    });

    new log.LogGroup(scope, 'SubscriberFunctionLogGroup', {
        logGroupName: `/aws/lambda/${subscriberFunction.functionName}`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        retention: log.RetentionDays.FIVE_DAYS
    })

    return subscriberFunction;
}