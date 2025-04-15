import { S3Event, SQSBatchResponse, SQSRecord, SQSEvent, SQSHandler, SQSBatchItemFailure } from "aws-lambda";

import { getTimestampMapByObjectKeys } from "./data-access/dynamodb/get-timestamp-map-by-object-keys";
import { reflectPutObjectData } from "./logic/reflect-put-object-data";
import { reflectDeleteObjectData } from "./logic/reflect-delete-object-data";
import { BucketEventMessageType } from "./type/bucket-event-message";
import { bucketEventTypeFromEventName } from "./type/bucket-event-type";

export const handler: SQSHandler = async (event: SQSEvent) => {
	const result = mainFunc(event.Records);

    return result;
}

export const mainFunc = async (sqsRecords: SQSRecord[]): Promise<SQSBatchResponse> => {
    const bucketEventMessages: BucketEventMessageType[] = [];

    for (const sqsRecord of sqsRecords) {
        const body = JSON.parse(sqsRecord.body) as S3Event;

        for (const s3Record of body.Records) {
            const eventType = bucketEventTypeFromEventName(s3Record.eventName);
            if (!eventType) {
                console.error(`S3 eventName ${s3Record.eventName} is not supported`);
                continue;
            }

            const objectKey = s3Record.s3.object.key;
            const eventTimestamp = new Date(s3Record.eventTime);
            if (bucketEventMessages.some(
                (message) => message.objectKey === objectKey && message.eventTimestamp.getDate() >= eventTimestamp.getDate()
            )) continue

            bucketEventMessages.push({
                messaqeId: sqsRecord.messageId,
                eventType: eventType,
                eventTimestamp: eventTimestamp,
                objectKey: objectKey
            })
        }
    }

    if (bucketEventMessages.length === 0) return { batchItemFailures: [] };

    const objectKeys = bucketEventMessages.map((message) => message.objectKey);
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
                    batchItemFailures: bucketEventMessages.map((message) => ({
                        itemIdentifier: message.messaqeId,
                    })),
                },
            };
        }
    })();

    if (timestampResponse.error) return timestampResponse.error;
    const timestampMap = timestampResponse.ok;
    console.log(`Timestamp map: ${[...timestampMap.values()]}`);

    const reflectPromises: Promise<string>[] = []
    bucketEventMessages.forEach(async (message) => {
        const timestamp = timestampMap.get(message.objectKey);
        if (timestamp && message.eventTimestamp.getTime() <= timestamp.getTime()) return;

        switch (message.eventType) {
            case "Put":
                const putPromise = new Promise<string>(async (resolve, reject) => {
                    reflectPutObjectData(message)
                        .then(() => {
                            console.log(`Successfully reflected data for objectKey: ${message.objectKey}`);
                            resolve('');
                        })
                        .catch((error) => {
                            console.error(`Failed to reflect data for objectKey: ${message.objectKey}, error: ${error}`);
                            reject(message.messaqeId);
                        });
                })
                reflectPromises.push(putPromise);
                break;
            case "Delete":
                const deletePromise = new Promise<string>(async (resolve, reject) => {
                    reflectDeleteObjectData(message)
                        .then(() => {
                            console.log(`Successfully reflected data for objectKey: ${message.objectKey}`);
                            resolve('');
                        })
                        .catch((error) => {
                            console.error(`Failed to reflect data for objectKey: ${message.objectKey}, error: ${error}`);
                            reject(message.messaqeId);
                        });
                })
                reflectPromises.push(deletePromise);
                break;
            default:
                console.error(`Unsupported S3 eventType ${message.eventType} is received`);
                return;
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