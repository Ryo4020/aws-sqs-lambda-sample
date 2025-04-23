import { SQSBatchResponse, SQSRecord, SQSEvent, SQSHandler, SQSBatchItemFailure } from "aws-lambda";

import { getTimestampMapByObjectKeys } from "./data-access/dynamodb/get-timestamp-map-by-object-keys";
import { reflectPutObjectData } from "./logic/reflect-put-object-data";
import { reflectDeleteObjectData } from "./logic/reflect-delete-object-data";
import { ReceivedSqsMessageType } from "./type/received-sqs-message";
import { SqsMessageBodyType } from "./type/sqs-message-body";

export const handler: SQSHandler = async (event: SQSEvent) => {
	const result = mainFunc(event.Records);

    return result;
}

export const mainFunc = async (sqsRecords: SQSRecord[]): Promise<SQSBatchResponse> => {
    const receivedMessages: ReceivedSqsMessageType[] = [];

    for (const sqsRecord of sqsRecords) {
        const body = JSON.parse(sqsRecord.body) as SqsMessageBodyType;

        const objectKey = body.objectKey;
        const eventTimestampMilliSec = body.eventTimestampMilliSec;
        if (receivedMessages.some(
            (message) => message.body.objectKey === objectKey && message.body.eventTimestampMilliSec >= eventTimestampMilliSec
        )) continue

        receivedMessages.push({
            messageId: sqsRecord.messageId,
            body
        })
    }

    if (receivedMessages.length === 0) return { batchItemFailures: [] };

    const objectKeys = receivedMessages.map((message) => message.body.objectKey);
    const timestampResponse = await (async () => {
        try {
            const getTimestampMapResponse = await getTimestampMapByObjectKeys(objectKeys);
            return {
                ok: getTimestampMapResponse,
                error: null,
            };
        } catch (error) {
            error instanceof Error ? console.error("Error: " + error.message) : console.error("Unexpected error: " + JSON.stringify(error));

            return {
                ok: null,
                error: {
                    batchItemFailures: receivedMessages.map((message) => ({
                        itemIdentifier: message.messageId,
                    })),
                },
            };
        }
    })();

    if (timestampResponse.error) return timestampResponse.error;
    const timestampMap = timestampResponse.ok;
    console.log(`Timestamp map: ${[...timestampMap.values()]}`);

    const reflectPromises: Promise<string>[] = []
    receivedMessages.forEach(async (message) => {
        const timestamp = timestampMap.get(message.body.objectKey);
        if (timestamp && message.body.eventTimestampMilliSec <= timestamp.getTime()) return;

        switch (message.body.eventType) {
            case "Put":
                const putPromise = new Promise<string>(async (resolve, reject) => {
                    reflectPutObjectData(message.body)
                        .then(() => {
                            console.log(`Successfully reflected data for put file name: ${message.body.objectKey}`);
                            resolve('');
                        })
                        .catch((error) => {
                            console.error(`Failed to reflect data for put file name: ${message.body.objectKey}, error: ${error}`);
                            reject(message.messageId);
                        });
                })
                reflectPromises.push(putPromise);
                break;
            case "Delete":
                const deletePromise = new Promise<string>(async (resolve, reject) => {
                    reflectDeleteObjectData(message.body)
                        .then(() => {
                            console.log(`Successfully reflected data for deleted file name: ${message.body.objectKey}`);
                            resolve('');
                        })
                        .catch((error) => {
                            console.error(`Failed to reflect data for deleted file name: ${message.body.objectKey}, error: ${error}`);
                            reject(message.messageId);
                        });
                })
                reflectPromises.push(deletePromise);
                break;
        }
    })

    const results = await Promise.allSettled(reflectPromises)
    const failedMessageIdentifiers: SQSBatchItemFailure[] = results
        .filter((result) => result.status === "rejected")
        .map((result) => ({ itemIdentifier: result.reason }));

    return {
        batchItemFailures: failedMessageIdentifiers,
    };
}