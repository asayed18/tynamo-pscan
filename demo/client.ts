import { DynamoDB, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { fromSSO } from "@aws-sdk/credential-provider-sso";
import { NodeHttpHandler } from "@smithy/node-http-handler";

const client = async (options: Partial<DynamoDBClientConfig>) => new DynamoDB({
    region: "eu-west-1",
    credentials: options?.credentials || await fromSSO({ profile: "prod" })(),
    maxAttempts: 6,
    retryMode: 'adaptive',
    requestHandler: new NodeHttpHandler({
        requestTimeout: 100000000,
        connectionTimeout: 20000,
    }),
});
export default client;
