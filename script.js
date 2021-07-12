const EventEmitter = require('events');
const logger = new EventEmitter();
const users = []
const msgs = []

logger.on('message', (msg) => {
    console.log(`New Message ${msg}`);
    msgs.push(msg);
})

logger.on('login', (name) => {
    console.log(`New User ${name}`);
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


logger.emit('message', 'Hello World!')
logger.emit('login', 'Eduard')
logger.emit('getUsers')
logger.emit('getMessages')


