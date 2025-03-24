import { SQSEvent, SQSBatchResponse, SQSHandler } from 'aws-lambda';

export const handler: SQSHandler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
	const result = MyLambdaFunction (event.Records);

    return result;
}

const MyLambdaFunction = (records: SQSEvent["Records"]): SQSBatchResponse => {
    for (const record of records) {
        console.log("Record:", record);
    }

    return {
        batchItemFailures: [],
    };
}