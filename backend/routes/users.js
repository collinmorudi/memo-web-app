const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const joi = require('joi');
const _ = require('lodash');
const { User, validateUser } = require('../models/user');
const auth = require('../middleware/auth');

// POST: Register a new user
router.post('/create-account', async (req, res) => {
    const {error} = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User with this email already registered.');
    user = new User(_.pick(req.body, ['firstName', 'latsName', 'email', 'password']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    const token = user.generateAuthToken();
    user.save();
    return res.send('Successfully registered.');
});

// POST: Login
function validateLogin(req) {
    const schema = {
        email: joi.string().min(5).max(255).required().email(),
        password: joi.string().min(5).max(255).required()
    };
    return schema.validate(req);
}   

router.post('/login', async (req, res) => {
    const {error} = validateLogin(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Invalid email or password.');
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid email or password.');
    const token = user.generateAuthToken();
    respose = {'token': token, 'email': user.email, 'memos': user.memos};
    return res.send(response);
});

// Add memo
function validateMemo(content) {
    const schema = joi.object({
        content: joi.string().required()
    });
    return schema.validate(content);
}

router.post('/add-memo', auth, async (req, res) => {
    const {error} = validateMemo(req.body);
    if (error) return res.status(400).send('Invalid memo.');
    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).send('Not authorized to perform this action.');
    user.memos.push({ timesStamp: Date.now(), content: req.body.content });
    user.save();
});


// Delete memo
function validateDeleteMemo(req) {
    const schema = joi.object({
        index: joi.number().integer().required(),
    });
    return schema.validate(req);
}

router.post('/delete-memo', auth, async(req, res) => {
    const {error} = validateDeleteMemo(req.body);
    if (error) return res.status(400).send('Invalid delete memo');
    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).send('Not authorized to perform this action.');
    user.memos.splice(req.body.index, 1);
    user.save();
    return res.send(user.memos);
});

// export
module.exports = router;