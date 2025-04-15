import { AttributeValue, QueryCommand, QueryCommandInput } from "@aws-sdk/client-dynamodb";

import { ApplicationContext } from "../application-context";
import { RetryableError } from "../../error/retryable-error";
import { S3ObjectContentData } from "../../type/s3-object-content-data";
import { validateNumberAttributeValue, validateStringAttributeValue } from "../../util/dynamodb-attribute-value";

export const getDataListByObjectKey = async (objectKey: string): Promise<S3ObjectContentData[]> => {
    const tableName = process.env.DATA_TABLE_NAME;
    if (!tableName) throw new Error("DATA_TABLE_NAME is not defined");

    const applicationContext = ApplicationContext.load();
    const dynamodbClient = applicationContext.getDynamoDBClient();

    const queryBatch = async (startKey?: Record<string, AttributeValue>): Promise<Record<string, AttributeValue>[]> => {
        const input: QueryCommandInput = {
            TableName: tableName,
            IndexName: 'source-file-index',
            KeyConditionExpression: 'source_file_name = :source_file_name',
            ExpressionAttributeValues: {
                ':source_file_name': { S: objectKey },
            },
            ExclusiveStartKey: startKey,
        };

        const command = new QueryCommand(input);
        const response = await dynamodbClient.send(command);

        if (!response.Items || response.Items.length === 0) return [];

        if (response.LastEvaluatedKey) {
            const nextBatch = await queryBatch(response.LastEvaluatedKey);
            return [...response.Items, ...nextBatch];
        }

        return response.Items;
    }

    const batchResponse = await (async () => {
        try {
            return await queryBatch();
        } catch (error) {
            if (error instanceof Error) throw new RetryableError("DynamoDB QueryItem error: " + error.message);
            throw new RetryableError("DynamoDB QueryItem error: " + JSON.stringify(error));
        }
    })();

    return batchResponse.map((item) => {
        const studentId = validateStringAttributeValue(item, 'student_id');
        const studentNum = validateNumberAttributeValue(item, 'student_num');
        const studentName = validateStringAttributeValue(item, 'student_name');
        const grade = validateNumberAttributeValue(item, 'grade');
        const className = validateStringAttributeValue(item, 'class_name');

        return {
            studentId,
            studentNum,
            studentName,
            grade,
            className
        }
    })
}