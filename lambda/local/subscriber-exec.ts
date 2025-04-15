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
            "Records":[
                {
                    "eventVersion":"2.1",
                    "eventSource":"aws:s3",
                    "awsRegion":"ap-northeast-1",
                    "eventTime":"2024-01-01T00:00:00.000Z",
                    "eventName":"ObjectCreated:Put",
                    "userIdentity":{"principalId":"AWS"},
                    "requestParameters":{"sourceIPAddress":"0.0.0.0"},
                    "responseElements":{
                        "x-amz-request-id":"request-id",
                        "x-amz-id-2":"id"
                    },
                    "s3":{
                        "s3SchemaVersion":"1.0",
                        "configurationId":"configuration-id",
                        "bucket":{
                            "name":"aws-queue-system-sample-event-source-bucket",
                            "ownerIdentity":{"principalId":"principal-id"},
                            "arn":"arn:aws:s3:::aws-queue-system-sample-event-source-bucket"
                        },
                        "object":{
                            "key":"sample.csv",
                            "size":181,
                            "eTag":"etag",
                            "versionId":"version-id",
                            "sequencer":"sequencer"
                        }
                    }
                },
                {
                    "eventVersion":"2.1",
                    "eventSource":"aws:s3",
                    "awsRegion":"ap-northeast-1",
                    "eventTime":"2024-01-01T00:00:00.000Z",
                    "eventName":"ObjectRemoved:Delete",
                    "userIdentity":{"principalId":"AWS"},
                    "requestParameters":{"sourceIPAddress":"0.0.0.0"},
                    "responseElements":{
                        "x-amz-request-id":"request-id",
                        "x-amz-id-2":"id"
                    },
                    "s3":{
                        "s3SchemaVersion":"1.0",
                        "configurationId":"configuration-id",
                        "bucket":{
                            "name":"aws-queue-system-sample-event-source-bucket",
                            "ownerIdentity":{"principalId":"principal-id"},
                            "arn":"arn:aws:s3:::aws-queue-system-sample-event-source-bucket"
                        },
                        "object":{
                            "key":"sample2.csv",
                            "size":181,
                            "eTag":"etag",
                            "versionId":"version-id",
                            "sequencer":"sequencer"
                        }
                    }
                }
            ]
        }`,
        attributes: {
            ApproximateReceiveCount: '1',
            SentTimestamp: '1743164028025',
            SenderId: 'sender-id:S3-PROD-END',
            ApproximateFirstReceiveTimestamp: '1743164028044'
        },
        messageAttributes: {},
        md5OfBody: 'md5-of-body',
        eventSource: 'aws:sqs',
        awsRegion: 'ap-northeast-1',
        eventSourceARN: ""
    }
]

mainFunc(records);