const express = require('express')
const app = express()
const port = 3000

const users = [
    { id: 1, name: 'James', age: 17 },
    { id: 2, name: 'Robert', age: 20 },
    { id: 3, name: 'John', age: 40 },
    { id: 4, name: 'Jack', age: 14 },
    { id: 5, name: 'Leo', age: 34 },
    { id: 6, name: 'Sam', age: 15 }
]

const numberify = function (req, res, next) {
    req.params.id = +req.params.id
    req.params.age = +req.params.age
    next()
}

app.get('/users', (req, res) => {
    res.send(users);
});

app.post('/post/:id/:name/:age', numberify, (req, res) => {
    users.push(req.params)
    res.send(users)
});

app.put('/put/:id/:name/:age', numberify, (req, res) => {
    let found = false
    for (const obj of users) {
        if (obj.id === req.params.id) {
            found = true
            obj.name = req.params.name
            obj.age = req.params.age
        }
    }
    if (found === false) {
        res.send('Error, id have not found');
    } else {
        res.send(users)
    }
});

app.delete('/del/:id', numberify, (req, res) => {
    let found = false
    for (const obj of users) {
        if (obj.id === req.params.id) {
            found = true
        }
    }
    if (found === false) {
        res.send('Error, id have not found');
    } else {
        users.splice(req.params.id-1, 1)
        res.send(users)
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})