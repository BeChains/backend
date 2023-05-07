import { promises as fs } from "fs";

async function asyncReadFile(filename: string = 'output.pdf') {
    const data = await fs.readFile(filename, "binary");
    return Buffer.from(data);
}

export {
    asyncReadFile
}