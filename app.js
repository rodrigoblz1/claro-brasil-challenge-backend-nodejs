'use strict';

require('dotenv').config();

// Ensure required ENV vars are set
let requiredEnv = ['DB_USER', 'DB_PASSWORD', 'DB_PROD', 'DB_TEST'];
let unsetEnv = requiredEnv.filter((env) => !(typeof process.env[env] !== 'undefined'));

if (unsetEnv.length > 0) {
  throw new Error('Required ENV variables are not set: [' + unsetEnv.join(', ') + '].\nCreate a .env file with them');
}

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let deviceController = require('./controllers/devices')
let userController = require('./controllers/users');
app.use('/devices', deviceController);
app.use('/users', userController);

module.exports = app;