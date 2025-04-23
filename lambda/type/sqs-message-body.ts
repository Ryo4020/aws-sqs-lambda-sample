import { BucketEventMessageType } from "./bucket-event-message";
import { S3ObjectContentData } from "./s3-object-content-data";

export type SqsMessageBodyType = BucketEventMessageType & BucketEventDataType<BucketEventMessageType["eventType"]>;

type BucketEventDataType<T extends BucketEventMessageType["eventType"]> = T extends "Put" ? {
    dataList: S3ObjectContentData[];
    eventType: T;
} : {
    eventType: T;
};