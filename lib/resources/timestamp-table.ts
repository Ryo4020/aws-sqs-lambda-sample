import { Construct } from 'constructs'
import * as cdk from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'

import { attachServicePrefix } from '../../util/attach-service-prefix';

export const generateTimestampTable = (scope: Construct) : dynamodb.TableV2 => {
    const table = new dynamodb.TableV2(scope, 'TimestampTable', {
        tableName: attachServicePrefix('TimestampTable'),
        partitionKey: { name: 'source_file_name', type: dynamodb.AttributeType.STRING },
        billing: dynamodb.Billing.onDemand(),
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        timeToLiveAttribute: 'ttl',
    });

    return table;
}