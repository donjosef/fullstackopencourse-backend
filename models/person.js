const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const url = process.env.MONGODB_URI;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to mongodb')
    })
    .catch((err) => {
        console.log('error with mongodb connection'.err.message)
    })

const personSchema = new Schema({
    name: {
        type: String,
        minlength: 3,
        unique: true
    },
    number: {
        type: String,
        minlength: 8
    }
});

personSchema.plugin(uniqueValidator);

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema);