import { Construct } from 'constructs'
import * as cdk from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'

import { attachServicePrefix } from '../../util/attach-service-prefix';

export const generateDataTable = (scope: Construct) : dynamodb.TableV2 => {
    const table = new dynamodb.TableV2(scope, 'DataTable', {
        tableName: attachServicePrefix('DataTable'),
        partitionKey: { name: 'student_id', type: dynamodb.AttributeType.STRING },
        sortKey: { name: 'student_num', type: dynamodb.AttributeType.NUMBER },
        globalSecondaryIndexes: [
            {
                indexName: 'source-file-index',
                partitionKey: { name: 'source_file_name', type: dynamodb.AttributeType.STRING },
                sortKey: { name: 'student_num', type: dynamodb.AttributeType.NUMBER },
            }
        ],
        billing: dynamodb.Billing.onDemand(),
        removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    return table;
}