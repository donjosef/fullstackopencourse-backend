const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const password = process.argv[2];

const url = `mongodb+srv://montyDev_:${password}@cluster0-rszlv.mongodb.net/phonebook?retryWrites=true&w=majority`;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new Schema({
    name: String,
    number: String
});

const Person = mongoose.model('Person', personSchema);

if (process.argv.length > 3) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    });

    person
        .save()
        .then(person => {
            console.log(`Added ${person.name} number ${person.number} to phonebook`)
            mongoose.connection.close()
        })
} else {
    Person
        .find()
        .then(persons => {
            const loggedPersons = persons.map(person => person.name + ' ' + person.number + '\n').join("");
            console.log('phonebook:' + '\n' + loggedPersons)
            mongoose.connection.close()
        })
}
