import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { attachServicePrefix } from '../../util/attach-service-prefix';

export const generateEventSourceBucket = (scope: Construct): s3.Bucket => {
    const bucket = new s3.Bucket(scope, 'EventSourceBucket', {
        autoDeleteObjects: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        bucketName: attachServicePrefix('event-source-bucket', true),
        lifecycleRules: [{
            abortIncompleteMultipartUploadAfter: cdk.Duration.days(2),
        }],
        versioned: true,
    });

    return bucket;
}