import { BucketEventTypeType } from "./bucket-event-type";

export type BucketEventMessageType = {
    eventType: BucketEventTypeType;
    eventTimestampMilliSec: number;
    objectKey: string;
}