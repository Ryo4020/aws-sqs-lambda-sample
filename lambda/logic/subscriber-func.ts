import { S3Event, SQSBatchResponse, SQSRecord } from "aws-lambda";

import { BucketEventMessageType } from "../type/bucket-event-message";
import { bucketEventTypeFromEventName } from "../type/bucket-event-type";

export const mainFunc = (sqsRecords: SQSRecord[]): SQSBatchResponse => {
    const bucketEventMessages: BucketEventMessageType[] = [];

    for (const sqsRecord of sqsRecords) {
        const body = JSON.parse(sqsRecord.body) as S3Event;

        const messages: BucketEventMessageType[] = body.Records.map((s3Record) => {
            if (!bucketEventTypeFromEventName(s3Record.eventName)) {
                throw new Error("S3 eventName is not supported");
            }

            return {
                messaqeId: sqsRecord.messageId,
                eventType: bucketEventTypeFromEventName(s3Record.eventName),
                eventTimestamp: new Date(s3Record.eventTime),
                objectKey: s3Record.s3.object.key,
            }
        })

        bucketEventMessages.push(...messages);
    }

    console.log("bucketEventMessages", bucketEventMessages);

    return {
        batchItemFailures: [],
    };
}