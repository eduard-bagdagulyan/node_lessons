const cluster = require('cluster');
const process = require('process');

if (cluster.isMaster) {
    console.log('Master Process is Started');
    const worker = cluster.fork();
    worker.send(50);
    worker.on('message', (msg) => {
        console.log(msg);
        worker.kill()
    })

} else if (cluster.isWorker) {
    process.on('message', (msg) => {
        const result = factorialize(msg);
        process.send(result)
    });
}

function factorialize(num) {
    if (num < 0)
        return -1;
    else if (num == 0)
        return 1;

    else {
        return (num * factorialize(num - 1));
    }
}