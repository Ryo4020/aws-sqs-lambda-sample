import { BucketEventTypeType } from "./bucket-event-type";

export type BucketEventMessageType = {
    messaqeId: string;
    eventType: BucketEventTypeType;
    eventTimestamp: Date;
    objectKey: string;
}