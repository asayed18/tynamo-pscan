import client from "./client";
import { appendFile } from "./files";
import Scanner, { Logger } from "_@";


const start = async () => {
    Logger.Progress();
    const scanner = new Scanner({
        client: await client({}),
        startSegment: 0,
        totalSegments: 1000000,
        batchSize: 500,

    })
    Logger.initialProgress = (scanner.batchIdx / scanner.totalSegments) * 100;

    Logger.logBeforeExit(scanner.logStats.bind(scanner));
    try {
        const scanIterator = scanner.scan({
            scanOptions: {
                TableName: process.env.TABLE,
                FilterExpression:
                    'attribute_not_exists(#data)'
                ,
                ExpressionAttributeNames: {
                    "#data": "data",
                    "#uuid": "uuid",
                },
                ProjectionExpression: '#uuid',
                Select: 'SPECIFIC_ATTRIBUTES',
            }
        });
        for await (const batch of scanIterator) {
            Logger.progress = scanner.progress;
            appendFile('out/user_data_test.txt', batch.Items?.reduce((acc, val) => val?.uuid?.S ? acc + `${val.uuid?.S}\r\n` : acc, '') as string)
        }
    } catch (e) {
        scanner.logStats();
        console.error(e);
        process.exit(1);
    }
}

start();





