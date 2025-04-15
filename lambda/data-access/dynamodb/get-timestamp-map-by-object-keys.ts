import { BatchGetItemCommandInput, AttributeValue, BatchGetItemCommand, KeysAndAttributes } from "@aws-sdk/client-dynamodb";

import { ApplicationContext } from "../application-context";
import { RetryableError } from "../../error/retryable-error";
import { validateDateAttributeValue, validateStringAttributeValue } from "../../util/dynamodb-attribute-value";

export const getTimestampMapByObjectKeys = async (objectKeys: string[]): Promise<Map<string, Date>> => {
    const tableName = process.env.TIMESTAMP_TABLE_NAME;
    if (!tableName) throw new Error("TIMESTAMP_TABLE_NAME is not defined");

    const applicationContext = ApplicationContext.load();
    const dynamodbClient = applicationContext.getDynamoDBClient();

    const tableKeys: Record<string, AttributeValue>[] = objectKeys.map((objectKey) => {
        return {
            source_file_name: { S: objectKey },
        }
    })
    const requestItems = {[tableName]: {
        Keys: tableKeys,
        ProjectionExpression: "source_file_name, event_timestamp",
    }};

    const queryBatch = async (requestItems: Record<string, KeysAndAttributes>): Promise<Record<string, AttributeValue>[]> => {
        const input: BatchGetItemCommandInput = {
            RequestItems: requestItems
        };

        const command = new BatchGetItemCommand(input);
        const response = await dynamodbClient.send(command);

        if (!response.Responses || !response.Responses[tableName]) return [];

        if (response.UnprocessedKeys && Object.keys(response.UnprocessedKeys).length > 0) {
            const additonalResponse = await queryBatch(response.UnprocessedKeys);

            return [...response.Responses[tableName], ...additonalResponse];
        }

        return response.Responses[tableName];
    }

    const batchResponse = await (async () => {
        try {
            return await queryBatch(requestItems);
        } catch (error) {
            if (error instanceof Error) throw new RetryableError("DynamoDB BatchGetItem error: " + error.message);
            throw new RetryableError("DynamoDB BatchGetItem error: " + JSON.stringify(error));
        }
    })();

    return new Map(batchResponse.map((item) => [
            validateStringAttributeValue(item, "source_file_name"),
            validateDateAttributeValue(item, "event_timestamp"),
        ]
    ))
}