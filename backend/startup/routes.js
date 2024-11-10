const express = require('express');
const cors = require ('cors');
const auth = require('../middleware/auth');
const users = require('../routes/users');

module.exports = function(app) {
    app.use(cors());
    app.use(express.json());
    app.use('/api/users', users);
    app.use('api/auth', auth);
}