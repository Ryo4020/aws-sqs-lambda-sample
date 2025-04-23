import { SQSEvent } from "aws-lambda";
import { mainFunc } from "../subscriber";

process.env.TIMESTAMP_TABLE_NAME = "AWSQueueSystemSampleTimestampTable";
process.env.DATA_TABLE_NAME = "AWSQueueSystemSampleDataTable";
process.env.BUCKET_NAME = "aws-queue-system-sample-event-source-bucket";

const records: SQSEvent["Records"] = [
    {
        messageId: 'message-id-1',
        receiptHandle: 'receipt-handle-1',
        body: `{
            "eventType": "Put",
            "eventTimestampMilliSec": 1735657200000,
            "objectKey": "sample.csv",
            "dataList": [
                {
                    "studentId": "s1",
                    "studentNum": 1,
                    "studentName": "a",
                    "grade": 1,
                    "className": "A"
                },
                {
                    "studentId": "s2",
                    "studentNum": 2,
                    "studentName": "b",
                    "grade": 1,
                    "className": "A"
                }
            ]
        }`,
        attributes: {
            ApproximateReceiveCount: '1',
            SentTimestamp: '1735657200000',
            SenderId: 'sender-id:S3-PROD-END',
            ApproximateFirstReceiveTimestamp: '1735657200000'
        },
        messageAttributes: {},
        md5OfBody: 'md5-of-body',
        eventSource: 'aws:sqs',
        awsRegion: 'ap-northeast-1',
        eventSourceARN: ""
    }
]

mainFunc(records);