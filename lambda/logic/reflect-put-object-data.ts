import { getDataListByObjectKey } from "../data-access/dynamodb/get-data-list-by-object-key";
import { transactReflectData } from "../data-access/dynamodb/transact-reflect-data";
import { RetryableError } from "../error/retryable-error";
import { SqsMessageBodyType } from "../type/sqs-message-body";

export const reflectPutObjectData = async (messageBody: SqsMessageBodyType): Promise<void> => {
    if (messageBody.eventType !== "Put") return;
    const s3DataList = messageBody.dataList;
    try {
        const tableDataList = await getDataListByObjectKey(messageBody.objectKey);
        console.log("Data from DynamoDB:", tableDataList);

        const targetDeleteList = tableDataList.filter((tableData) =>
            !s3DataList.some((s3Data) => s3Data.studentId === tableData.studentId)
        );

        await transactReflectData(messageBody, s3DataList, targetDeleteList);
    } catch (error) {
        if (error instanceof Error) throw new RetryableError("reflect put data error: " + error.message);
        throw new RetryableError("reflect put data error: " + JSON.stringify(error));
    }
}