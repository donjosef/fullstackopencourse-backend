const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');


let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "77665544",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
];

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'build')));
app.use((req, res, next) => {
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE,GET,PATCH,POST,PUT',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    });
    next();
});
app.use(morgan(function (tokens, req, res) {
    const method = tokens.method(req, res);
    let logResult = [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms'
    ];

    if (method !== 'POST') {
        return logResult.join(' ')
    }

    return [...logResult, JSON.stringify(req.body)].join(' ')
}))

app.get('/info', (req, res) => {
    const date = new Date().toLocaleString();
    res.send(
        `<p>Phonebook has info for ${persons.length} people</p>
        <p>${date}</p>`
    )
})

app.get('/api/persons', (req, res) => {
    res.status(200).json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const requestedId = +req.params.id;
    const person = persons.find(person => person.id === requestedId);
    if (person) {
        return res.json(person)
    } else {
        return res.status(404).json({ message: 'Cannot found requested person' })
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const requestedId = +req.params.id;
    const filteredPersons = persons.filter(person => person.id !== requestedId);
    res.status(204).end();
})

app.post('/api/persons', (req, res) => {
    const person = req.body;
    const existingPerson = persons.find(p => p.name === person.name);
    
    if (existingPerson) {
        return res.status(409).json({ error: 'Person name already exists in phonebook' })
    }
    
    if (!person.name || !person.number) {
        return res.status(400).json({ error: 'Person name or number missing.' })
    }

    const id = Math.random() * 10000;
    person.id = id;
    persons = persons.concat(person)
    res.status(201).json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log('App listening on port 3001')
})