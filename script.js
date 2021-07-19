const readline = require('readline');
const fs = require('fs');
const path = require('path')

//First Homework

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

// rl.question('Enter The Path: ', (answer) => {
//     const normalizedPath = path.normalize(answer);
//     console.log(fs.readFileSync(normalizedPath, 'utf8'));
//     rl.close();
// });

// Second Homework
// const csv = require('csvtojson');
// csv().fromFile('addresses.csv').then((jsonObj) => {
//     fs.writeFileSync('addresses.json', JSON.stringify(jsonObj, null, 2))
// })

//Third Homework
debugger
function printTree(dir, depth) {
    depth = depth || 0;
    console.log(dir, depth);
    fs.readdir(dir, (err, res) => {
        if (err) {
            return
        } else {
            for (const elem of res) {
                const newPath = path.join(dir, elem)
                printTree(newPath, depth+1)
            }
        }
    })
}
printTree('dir')