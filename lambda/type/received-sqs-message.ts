import { SqsMessageBodyType } from "./sqs-message-body";

export type ReceivedSqsMessageType = {
    messageId: string;
    body: SqsMessageBodyType;
}