import * as fs from 'fs'

export const appendFile = async (filename: string, data: string) => {
    await fs.appendFile(filename, data, (err) => { console.error(err) });
}