import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";

let applicationContextCashe: ApplicationContext | null = null;
export class ApplicationContext {
    private dynamoDBClient: DynamoDBClient | null = null;
    private s3Client: S3Client | null = null;
    private sqsClient: SQSClient | null = null;

    private constructor() {}

    public getDynamoDBClient(): DynamoDBClient {
        if (this.dynamoDBClient) return this.dynamoDBClient;

        this.dynamoDBClient = new DynamoDBClient({});

        return this.dynamoDBClient;
    }

    public getS3Client(): S3Client {
        if (this.s3Client) return this.s3Client;

        this.s3Client = new S3Client({});

        return this.s3Client;
    }

    public getSQSClient(): SQSClient {
        if (this.sqsClient) return this.sqsClient;

        this.sqsClient = new SQSClient({});

        return this.sqsClient;
    }

    public static load(): ApplicationContext {
        if (applicationContextCashe) {
            return applicationContextCashe;
        }

        const applicationContext = new ApplicationContext();
        applicationContextCashe = applicationContext;

        return applicationContext;
    }
}