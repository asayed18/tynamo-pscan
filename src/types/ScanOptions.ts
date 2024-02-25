import { ScanCommandInput, ScanCommandOutput } from "@aws-sdk/client-dynamodb";

export type ScanOptions = {
    scanOptions: ScanCommandInput;
    callback?: (batch: ScanCommandOutput) => Promise<void>;
}