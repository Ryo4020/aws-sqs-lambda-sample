import { CloudWatchLogsClient, DescribeLogGroupsCommand, PutRetentionPolicyCommand } from "@aws-sdk/client-cloudwatch-logs";

const cloudWatchLogsClientCashe: CloudWatchLogsClient | null = null;

const putRetentionToLogGroups = async () => {
    const client = cloudWatchLogsClientCashe ?? new CloudWatchLogsClient({});

    const command = new DescribeLogGroupsCommand({
        logGroupNamePrefix: "/aws/lambda/AWSQueueSystemSampleStack-",
        limit: 2,
        logGroupClass: "STANDARD"
    });
    const response = await client.send(command);
    console.log("Log groups:", response.logGroups);

    if (!response.logGroups) return;
    for (const logGroup of response.logGroups) {
        if (!logGroup.logGroupName || logGroup.retentionInDays) continue;
        const command = new PutRetentionPolicyCommand({
            logGroupName: logGroup.logGroupName,
            retentionInDays: 5,
        });

        try {
            await client.send(command);
            console.log(`Set retention policy for ${logGroup.logGroupName}`);
        } catch (error) {
            console.error(`Error setting retention policy for ${logGroup.logGroupName}:`, error);
        }
    }
}

putRetentionToLogGroups()