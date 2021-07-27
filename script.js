const fs = require('fs');
const zlib = require('zlib');
const path = require('path')

const zip = zlib.createGzip()
const folderPath = process.argv.slice(2)
const files = fs.readdirSync(folderPath[0])
const newFolder = fs.mkdirSync('folder2')

for (const file of files) {
    const input = fs.createReadStream(path.join(folderPath[0], file));
    const output = fs.createWriteStream('folder2/archive.zip');
    input.pipe(zip).pipe(output)
}
