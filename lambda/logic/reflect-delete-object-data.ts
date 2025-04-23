import { getDataListByObjectKey } from "../data-access/dynamodb/get-data-list-by-object-key";
import { transactDeleteData } from "../data-access/dynamodb/transact-delete-data";
import { RetryableError } from "../error/retryable-error";
import { SqsMessageBodyType } from "../type/sqs-message-body";

export const reflectDeleteObjectData = async (messageBody: SqsMessageBodyType): Promise<void> => {
    try {
        const tableDataList = await getDataListByObjectKey(messageBody.objectKey);
        if (tableDataList.length === 0) return;

        await transactDeleteData(messageBody, tableDataList);
    } catch (error) {
        if (error instanceof Error) throw new RetryableError("delete object data error: " + error.message);
        throw new RetryableError("delete object data error: " + JSON.stringify(error));
    }
}