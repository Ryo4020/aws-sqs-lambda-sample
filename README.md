# CDK TypeScript project

This is an AWS CDK project, **"AWS SQS Lambda Sample"**.

You can deploy **ETL system** (csv file on S3 to DynamoDB).
![aws-sqs-lambda-sample](https://github.com/user-attachments/assets/7cbe4762-33ce-4007-9cd9-e7541bde28b2)

## How to deploy
```
export AWS_PROFILE={aws_profile_name}

npm install

npx cdk deploy AWSQueueSystemSampleStack
npm run cmd-put-retention
```

## How to use deployed system
- upload csv file about students to S3 bucket (`{your-system-name}-event-source-bucket`)
    - [sample.csv](sample.csv) might be a helpful example.


## How to destroy deployed resources
```
npx cdk destroy AWSQueueSystemSampleStack
```
