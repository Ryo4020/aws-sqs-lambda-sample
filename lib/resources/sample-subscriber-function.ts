import { Construct } from "constructs";
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as log from 'aws-cdk-lib/aws-logs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export const generateSampleSubscriberFunction = (scope: Construct, queue: sqs.Queue) => {
    // Create a Role for lambda function
    const role = new iam.Role(scope, 'SampleSubscriberFunctionRole', {
        roleName: 'SampleSubscriberFunctionRole',
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
        ]
    });

    const subscriberFunction = new nodeLambda.NodejsFunction(scope, 'SampleSubscriberFunction', {
        functionName: 'SampleSubscriberFunction',
        runtime: lambda.Runtime.NODEJS_LATEST,
        handler: 'handler',
        entry: 'lambda/sample-subscriber.ts',
        role: role,
        environment: {
            QUEUE_URL: queue.queueUrl
        },
    });

    new log.LogGroup(scope, 'SampleSubscriberFunctionLogGroup', {
        logGroupName: `/aws/lambda/${subscriberFunction.functionName}`,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        retention: log.RetentionDays.FIVE_DAYS
    })

    // Add the SQS event source to the Lambda function
    subscriberFunction.addEventSource(new SqsEventSource(queue));

    return subscriberFunction;
}