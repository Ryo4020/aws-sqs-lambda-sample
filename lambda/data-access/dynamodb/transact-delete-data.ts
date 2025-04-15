import { TransactWriteItem, TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";

import { ApplicationContext } from "../application-context";
import { RetryableError } from "../../error/retryable-error";
import { S3ObjectContentData } from "../../type/s3-object-content-data";

export const transactDeleteData = async (sourceFileName: string, deleteDataList: S3ObjectContentData[]): Promise<void> => {
    const dataTableName = process.env.DATA_TABLE_NAME;
    const timestampTableName = process.env.TIMESTAMP_TABLE_NAME;
    if (!dataTableName || !timestampTableName) throw new Error("DATA_TABLE_NAME or TIMESTAMP_TABLE_NAME is not defined");

    const applicationContext = ApplicationContext.load();
    const dynamodbClient = applicationContext.getDynamoDBClient();

    const nowMilliseconds = Date.now();

    const deleteItems: TransactWriteItem[] = deleteDataList.map((data) => ({
        Delete: {
            TableName: dataTableName,
            Key: {
                student_id: { S: data.studentId },
                student_num: { N: data.studentNum.toString()}
            },
            ConditionExpression: "source_file_name = :source_file_name",
            ExpressionAttributeValues: {
                ":source_file_name": { S: sourceFileName }
            }
        }
    }));
    const putTimestamp: TransactWriteItem = {
        Put: {
            TableName: timestampTableName,
            Item: {
                source_file_name: { S: sourceFileName },
                event_timestamp: { N: nowMilliseconds.toString() },
                ttl: { N: (Math.floor(nowMilliseconds / 1000) + 60 * 60 * 24 * 3).toString() }, // 3 days
            },
        }
    }

    const command = new TransactWriteItemsCommand({
        TransactItems: [
            ...deleteItems,
            putTimestamp
        ]
    });

    try {
        await dynamodbClient.send(command);
    } catch (error) {
        if (error instanceof Error) throw new RetryableError("DynamoDB TransactWriteItems for delete error: " + error.message);
        throw new RetryableError("DynamoDB TransactWriteItems for delete error: " + JSON.stringify(error));
    }
}