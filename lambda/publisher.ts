import { S3Event, S3EventRecord } from "aws-lambda";
import { BatchResultErrorEntry } from "@aws-sdk/client-sqs";

import { BucketEventMessageType } from "./type/bucket-event-message";
import { bucketEventTypeFromEventName } from "./type/bucket-event-type";
import { SqsMessageBodyType } from "./type/sqs-message-body";
import { getPutS3ObjectContent } from "./data-access/s3/get-put-s3-object-content";
import { batchSendMessages } from "./data-access/sqs/batch-send-messages";

export const handler = async (event: S3Event) => {
	const result = mainFunc(event.Records);

    return result;
}

export const mainFunc = async (s3Records: S3EventRecord[]): Promise<string> => {
    const bucketEventMessages: BucketEventMessageType[] = [];
    const getSqsMessageBodyPromises: Promise<SqsMessageBodyType>[] = [];

    for (const s3Record of s3Records) {
        const eventType = bucketEventTypeFromEventName(s3Record.eventName);
        if (!eventType) {
            console.error(`S3 eventName ${s3Record.eventName} is not supported`);
            continue;
        }

        const objectKey = s3Record.s3.object.key;
        const eventTimestampMilliSec = new Date(s3Record.eventTime).getTime();
        if (bucketEventMessages.some(
            (message) => message.objectKey === objectKey && message.eventTimestampMilliSec >= eventTimestampMilliSec
        )) continue

        bucketEventMessages.push({
            eventType,
            eventTimestampMilliSec,
            objectKey
        })

        switch (eventType) {
            case "Put":
                const putPromise = new Promise<SqsMessageBodyType>(async (resolve, reject) => {
                    getPutS3ObjectContent(objectKey)
                        .then((dataList) => resolve({
                            eventType,
                            eventTimestampMilliSec,
                            objectKey,
                            dataList
                        }))
                        .catch((error) => {
                            console.error(`Failed to get content of objectKey: ${objectKey}, error: ${error}`);
                            reject(null);
                        });
                })
                getSqsMessageBodyPromises.push(putPromise);
                break;
            case "Delete":
                const deletePromise = Promise.resolve<SqsMessageBodyType>({
                    eventType,
                    eventTimestampMilliSec,
                    objectKey
                });
                getSqsMessageBodyPromises.push(deletePromise);
                break;
            default:
                console.error(`Unsupported S3 eventType ${eventType} is received`);
                break;
        }
    }

    const results = await Promise.allSettled(getSqsMessageBodyPromises)
    const messageBodyList: SqsMessageBodyType[] = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value)

    const failedMessageEntries: BatchResultErrorEntry[] = []
    const chunkSize = 10;
    try {
        for (let i = 0; i < messageBodyList.length; i += chunkSize) {
            const failedSendResponse = await batchSendMessages(messageBodyList.slice(i, i + chunkSize));
            if (failedSendResponse) failedMessageEntries.push(...failedSendResponse);
        }
    } catch (error) {
        console.error('Failed to batch send messages, error: ', error);
        return "Failed to send messages";
    }

    if (failedMessageEntries.length === 0) {
        console.log(`Successfully sent messages: ${JSON.stringify(messageBodyList.map((message) => message.objectKey))}`);
        return "Successfully sent messages";
    } else {
        console.error(`Failed to send messages: ${JSON.stringify({
            failedMessageEntries: failedMessageEntries.map((entry) => ({
                Id: entry.Id,
                SenderFault: entry.SenderFault,
                Message: entry.Message,
                Code: entry.Code
            }))
        })}`);
        return "Some messages failed to send";
    }
}