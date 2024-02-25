import { BATCH_SIZE, SEGMENTS } from '_@/constants'
import { ConsoleColors, Logger } from '_@/log'
import { ScannerConstructor, ScanOptions } from '_@/types'
import { AttributeValue, DynamoDB, ScanCommandOutput } from '@aws-sdk/client-dynamodb'

export default class Scanner {
    client: DynamoDB

    totalSegments: number

    batchSize: number

    batchIdx: number

    totalRecords = 0

    progress = 0

    callbackQueue: boolean[] = []

    constructor(options: ScannerConstructor) {
        this.client = options.client
        this.totalSegments = options.totalSegments || SEGMENTS
        this.batchSize = options.batchSize || BATCH_SIZE
        this.batchIdx = options.startSegment || 0
    }

    private increment() {
        this.batchIdx += this.batchSize
        this.progress = parseFloat(((this.batchIdx / this.totalSegments) * 100).toFixed(2))
    }

    async runCb(callback: (batch: ScanCommandOutput) => Promise<void>, batch: ScanCommandOutput): Promise<void> {
        this.callbackQueue.push(true)
        callback(batch).then(() => {
            this.callbackQueue.shift()
        }).catch(() => {
            console.error('Error in batch callback', batch)
            this.callbackQueue.shift()
        })
    }

    /**
     * Asynchronously scans dynamodb table in parallel using the provided options.
     * @param options - The scan options.
     * @returns An async iterator that yields the scan results.
     */
    async * scan(options: ScanOptions) {
        const promises = (start: number) => new Array(this.batchSize).fill(undefined).map<Promise<ScanCommandOutput>>(
            (_, i) => this.client.scan({ ...options.scanOptions, TotalSegments: SEGMENTS, Segment: i + start }),
        )
        while (this.batchIdx < this.totalSegments) {
            const batch = promises(this.batchIdx)
            const batchResults = await Promise.all(batch)
            this.increment()
            const result: { Count: number; Items: Record<string, AttributeValue>[] } = { Count: 0, Items: [] }
            for (const r of batchResults) {
                if (r.Count) {
                    result.Count += (r.Count ?? 0)
                    result.Items.push(...(r.Items ?? []))
                }
            }
            this.totalRecords += result.Count
            if (options.callback) {
                this.runCb(options.callback, result as ScanCommandOutput)
            } else {
                yield result as ScanCommandOutput
            }
        }
        // wait for all callbacks to finish
        while (options.callback && this.callbackQueue.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
    }

    logStats() {
        console.log(
            Logger.colorMessage('Scan Results:', ConsoleColors.BgBlue) +
            Logger.colorMessage(
                ` Total Segments: ${this.totalSegments}` +
                `| Batch Size: ${this.batchSize} ` +
                `| Current Batch: ${this.batchIdx} ` +
                `| Total Records: ${this.totalRecords} ` +
                `| Progress: ${((this.batchIdx / this.totalSegments) * 100).toFixed(2)}%`,
                ConsoleColors.BgRed,
            ),
        )
    }
}
