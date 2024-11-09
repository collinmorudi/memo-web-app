const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const joi = require('joi');
require('dotenv').config();

// user model
const mongoSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,  // todo: remove later
    },
    passord: {
        type: String,
        required: true,
    },
    memos: [
        {
            timesStamp: {
                type: Date,
                default: Date.now, // todo: remove later
            },
            content: {
                type: String,
                required: true,
            }
        }
    ]
});

mongoSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_PRIVATE_KEY);
    return token;
}

const User = mongoose.model('User', mongoSchema);

// REST validation
function validateUser(user) {
    const schema = {
        firstName: joi.string().required(),
        lastName: joi.string().required(),
        email: joi.string().required().email(),
        password: joi.string().required(),
    }
    return schema.validate(user);
}

// exports
module.exports = {
    User,
    validateUser,
}