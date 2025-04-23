import { BatchResultErrorEntry, SendMessageBatchCommand } from "@aws-sdk/client-sqs";

import { ApplicationContext } from "../application-context";
import { SqsMessageBodyType } from "../../type/sqs-message-body";
import { RetryableError } from "../../error/retryable-error";

export const batchSendMessages = async (messageBodies: SqsMessageBodyType[]): Promise<BatchResultErrorEntry[] | undefined> => {
    const queueUrl = process.env.QUEUE_URL;
    if (!queueUrl) throw new Error("QUEUE_URL is not defined");

    const applicationContext = ApplicationContext.load();
    const sqsClient = applicationContext.getSQSClient();

    const command = new SendMessageBatchCommand({
        QueueUrl: queueUrl,
        Entries: messageBodies.map((body) => ({
            Id: body.objectKey.split(".")[0], // Use the object key without the extension as the Id
            MessageBody: JSON.stringify(body)
        }))
    })

    try {
        const response = await sqsClient.send(command);
        return response.Failed
    } catch (error) {
        if (error instanceof Error) throw new RetryableError("SQS SendMessageBatch error: " + error.message);
        throw new RetryableError("SQS SendMessageBatch error: " + JSON.stringify(error));
    }
}