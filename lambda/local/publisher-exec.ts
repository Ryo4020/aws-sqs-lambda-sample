import { S3Event } from "aws-lambda";
import { mainFunc } from "../publisher";

if (!process.env.QUEUE_URL) throw new Error("QUEUE_URL is not set")
process.env.BUCKET_NAME = "aws-queue-system-sample-event-source-bucket";

const records: S3Event["Records"] = [
    {
        eventVersion:"2.1",
        eventSource:"aws:s3",
        awsRegion:"ap-northeast-1",
        eventTime:"2025-04-24T00:00:00.000Z",
        eventName:"ObjectCreated:Put",
        userIdentity:{principalId:"AWS"},
        requestParameters:{sourceIPAddress:"0.0.0.0"},
        responseElements:{
            "x-amz-request-id":"request-id",
            "x-amz-id-2":"id"
        },
        s3:{
            s3SchemaVersion:"1.0",
            configurationId:"configuration-id",
            bucket:{
                name:"aws-queue-system-sample-event-source-bucket",
                ownerIdentity:{"principalId":"principal-id"},
                arn:"arn:aws:s3:::aws-queue-system-sample-event-source-bucket"
            },
            object:{
                key:"sample.csv",
                size:181,
                eTag:"etag",
                versionId:"version-id",
                sequencer:"sequencer"
            }
        }
    },
    {
        eventVersion:"2.1",
        eventSource:"aws:s3",
        awsRegion:"ap-northeast-1",
        eventTime:"2024-01-01T00:00:00.000Z",
        eventName:"ObjectRemoved:Delete",
        userIdentity:{"principalId":"AWS"},
        requestParameters:{"sourceIPAddress":"0.0.0.0"},
        responseElements:{
            "x-amz-request-id":"request-id",
            "x-amz-id-2":"id"
        },
        s3:{
            s3SchemaVersion:"1.0",
            configurationId:"configuration-id",
            bucket:{
                name:"aws-queue-system-sample-event-source-bucket",
                ownerIdentity:{"principalId":"principal-id"},
                arn:"arn:aws:s3:::aws-queue-system-sample-event-source-bucket"
            },
            object:{
                key:"sample2.csv",
                size:181,
                eTag:"etag",
                versionId:"version-id",
                sequencer:"sequencer"
            }
        }
    }
]

mainFunc(records);