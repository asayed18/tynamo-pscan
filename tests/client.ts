import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const isTest = process.env.JEST_WORKER_ID;
const config = {
    convertEmptyValues: true,
    ...(isTest && {
        endpoint: 'localhost:8000',
        sslEnabled: false,
        region: 'local-env',
    }),
};

export default new DynamoDBClient(config);
