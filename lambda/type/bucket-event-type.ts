const BUCKET_EVENT_TYPES = ["Put", "Delete"] as const;
export type BucketEventTypeType = typeof BUCKET_EVENT_TYPES[number];

export const bucketEventTypeFromEventName = (eventName: string): BucketEventTypeType | null => {
    if (eventName.includes("ObjectCreated")) return "Put";
    if (eventName.includes("ObjectRemoved")) return "Delete";
    return null;
}