import { AttributeValue } from "@aws-sdk/client-dynamodb";

export const validateStringAttributeValue = (record: Record<string, AttributeValue>, key: string): string => {
    const attributeValue = record[key];
    if (!attributeValue.S) throw new Error(`String attribute value for ${key} in DynamoDB is required`);

    return attributeValue.S;
}

export const validateNumberAttributeValue = (record: Record<string, AttributeValue>, key: string): number => {
    const attributeValue = record[key];
    if (!attributeValue.N || isNaN(parseInt(attributeValue.N))) throw new Error(`Number attribute value for ${key} in DynamoDB is required`);

    return parseInt(attributeValue.N);
}

export const validateDateAttributeValue = (record: Record<string, AttributeValue>, key: string): Date => {
    const attributeValue = record[key];
    if (!attributeValue.N || isNaN(parseInt(attributeValue.N))) throw new Error(`Date attribute value for ${key} in DynamoDB is required`);

    return new Date(parseInt(attributeValue.N));
}