//First Homework
// const readline = require('readline');
// const fs = require('fs');
// const path = require('path')

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

// rl.question('Enter The Path: ', (answer) => {
//     const normalizedPath = path.normalize(answer);
//     console.log(fs.readFileSync(normalizedPath, 'utf8'));
//     rl.close();
// });

//Second Homework
// const csv = require('csvtojson');
// csv().fromFile('addresses.csv').then((jsonObj) => {
//     console.log(jsonObj);
// })

//Third Homework
const tree = require('tree-node-cli');
console.log(tree('dir'));