import { getDataListByObjectKey } from "../data-access/dynamodb/get-data-list-by-object-key";
import { transactDeleteData } from "../data-access/dynamodb/transact-delete-data";
import { RetryableError } from "../error/retryable-error";
import { BucketEventMessageType } from "../type/bucket-event-message";

export const reflectDeleteObjectData = async (message: BucketEventMessageType): Promise<void> => {
    try {
        const tableDataList = await getDataListByObjectKey(message.objectKey);
        if (tableDataList.length === 0) return;

        await transactDeleteData(message.objectKey, tableDataList);
    } catch (error) {
        if (error instanceof Error) throw new RetryableError("delete object data error: " + error.message);
        throw new RetryableError("delete object data error: " + JSON.stringify(error));
    }
}