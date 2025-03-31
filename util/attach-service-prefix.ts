export const attachServicePrefix = (name: string, lowercase?: boolean): string => {
    const servicePrefix = lowercase ? 'aws-queue-system-sample-' : 'AWSQueueSystemSample';

    return servicePrefix + name;
}