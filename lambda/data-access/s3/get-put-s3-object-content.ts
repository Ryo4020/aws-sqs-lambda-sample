import { GetObjectCommand } from "@aws-sdk/client-s3";
import { ApplicationContext } from "../application-context";
import { RetryableError } from "../../error/retryable-error";
import { parseS3ObjectContent, S3ObjectContentData } from "../../type/s3-object-content-data";

export const getPutS3ObjectContent = async (objectKey: string): Promise<S3ObjectContentData[]> => {
    const bucketName = process.env.BUCKET_NAME;
    if (!bucketName) throw new Error("BUCKET_NAME is not defined");

    const applicationContext = ApplicationContext.load();
    const s3Client = applicationContext.getS3Client();

    const input = {
        Bucket: bucketName,
        Key: objectKey,
    }

    const command = new GetObjectCommand(input);

    const response = await (async () => {
        try {
            return await s3Client.send(command);
        } catch (error) {
            if (error instanceof Error) throw new RetryableError("S3 GetObject error: " + error.message);
            throw new RetryableError("S3 GetObject error: " + JSON.stringify(error));
        }
    })();
    if (!response.Body) throw new RetryableError(`Response body of ${objectKey} is null`);

    const str = await response.Body.transformToString();
    const rows = str.split("\n").slice(1); // Skip the header row
    try {
        return rows.map((row) => {
            const columns = row.split(",");
            return parseS3ObjectContent(columns);
        });
    } catch (error) {
        if (error instanceof Error) throw new RetryableError("S3 object parse error: " + error.message);
        throw new RetryableError("S3 object parse unexpected error: " + JSON.stringify(error));
    }
}