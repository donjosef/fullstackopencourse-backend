require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const Person = require('./models/person');

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

app.use(express.static(path.join(__dirname, 'build')));

app.use(bodyParser.json());

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

app.use((req, res, next) => {
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE,GET,PATCH,POST,PUT',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    });
    next();
});


app.get('/info', (req, res) => {
    const date = new Date().toLocaleString();
    Person
        .find()
        .then(persons => {
            res.send(
                `<p>Phonebook has info for ${persons.length} people</p>
                <p>${date}</p>`
            )
        })
})

app.get('/api/persons', (req, res) => {
    Person
        .find()
        .then(data => {
            const persons = data.map(person => person.toJSON())
            res.status(200).json(persons)
        })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person
        .findById(req.params.id)
        .then(person => {
            if (!person) {
                return res.status(404).end()
            }

            return res.status(200).json(person.toJSON())
        })
        .catch(err => {
            next(err)
        })
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person
        .findById(req.params.id)
        .then(person => {
            if (!person) {
                return res.status(404).end()
            }

            return person.delete()
        })
        .then(() => {
            res.status(204).end();
        })
        .catch(err => {
            next(err)
        })
})

app.post('/api/persons', (req, res, next) => {
    const person = new Person({
        name: req.body.name,
        number: req.body.number
    });

    if (!person.name || !person.number) {
        return res.status(400).json({ error: 'Person name or number missing.' })
    }

    person
        .save()
        .then(savedPerson => {
            res.status(201).json(savedPerson.toJSON())
        })
        .catch(err => {
            return next(err)
        })
})

app.put('/api/persons/:id', (req, res, next) => {
    Person
        .findById(req.params.id)
        .then(person => {
            if (!person) {
                return res.status(404).end()
            }

            person.number = req.body.number;
            return person.save();
        })
        .then(person => {
            return res.status(200).json(person.toJSON())
        })
        .catch(err => {
            next(err)
        })
})

app.use((err, req, res, next) => {
    console.log(err)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).send({ error: 'Malformatted id' })
    } else if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message })
    }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log('App listening on port 3001')
})