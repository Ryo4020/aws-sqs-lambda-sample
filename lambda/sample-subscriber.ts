import { SQSEvent, Context, Callback, SQSBatchResponse } from 'aws-lambda';

export const handler = async (event: SQSEvent, _: Context, callback: Callback<void | object>) => {
	var result = MyLambdaFunction (event.Records);

    callback(null, result);
}

const MyLambdaFunction = (records: SQSEvent["Records"]): SQSBatchResponse => {
    for (const record of records) {
        console.log("Record:", record);
    }

    return {
        batchItemFailures: [],
    };
}