const EventEmitter = require('events');
const logger = new EventEmitter();
const process = require('process')
const args = process.argv.slice(2)

const users = []
const msgs = []

logger.on('message', (msg) => {
    console.log(`New Message: ${msg}`);
    msgs.push(msg);
})

logger.on('login', (name) => {
    console.log(`New User: ${name}`);
    users.push(name);
})

logger.on('getUsers', () => {
    console.log('Logged Users:');
    for (const user of users) {
        console.log(user + '\n');
    }
})

logger.on('getMessages', () => {
    console.log('Messages:');
    for (const user of msgs) {
        console.log(user + '\n');
    }
})

if (args) {
    if (args[0] == '--addUser') {
        logger.emit('login', args[1])
    } else if (args[0] == '--message') {
        logger.emit('message', args[1])
    } else {
        console.log('Undefined Command');
    }
} else {
    console.log('You have not entered args');
}
