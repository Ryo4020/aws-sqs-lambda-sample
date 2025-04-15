import { getDataListByObjectKey } from "../data-access/dynamodb/get-data-list-by-object-key";
import { transactReflectData } from "../data-access/dynamodb/transact-reflect-data";
import { getPutS3ObjectContent } from "../data-access/s3/get-put-s3-object-content";
import { RetryableError } from "../error/retryable-error";
import { BucketEventMessageType } from "../type/bucket-event-message";

export const reflectPutObjectData = async (message: BucketEventMessageType): Promise<void> => {
    try {
        const [s3DataList, tableDataList] = await Promise.all(
            [getS3Async(message.objectKey), getTableDataAsync(message.objectKey)]
        );

        const targetDeleteList = tableDataList.filter((tableData) =>
            s3DataList.some((s3Data) => s3Data.studentId === tableData.studentId)
        );

        await transactReflectData(message.objectKey, s3DataList, targetDeleteList);
    } catch (error) {
        if (error instanceof Error) throw new RetryableError("reflect put data error: " + error.message);
        throw new RetryableError("reflect put data error: " + JSON.stringify(error));
    }
}

const getS3Async = async (objectKey: string) => {
    return getPutS3ObjectContent(objectKey).then((data) => {
        if (data.length === 0) throw new Error(`No data found for object key: ${objectKey}`);

        console.log("Data from event source bucket:", data);
        return data;
    })
}

const getTableDataAsync = async (objectKey: string) => {
    return getDataListByObjectKey(objectKey).then((data) => {
        console.log("Data from DynamoDB:", data);
        return data;
    })
}