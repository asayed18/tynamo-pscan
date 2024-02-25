import { DynamoDB } from '@aws-sdk/client-dynamodb'

export interface ScannerConstructor {
    client: DynamoDB;
    totalSegments?: number;
    batchSize?: number;
    startSegment?: number;
}