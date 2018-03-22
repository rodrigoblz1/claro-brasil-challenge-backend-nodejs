'use strict';

require('dotenv').config();
const config = require('./config');
const logger = require('./logger');

// Database connection
require('./db-connection')(logger, config);

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let deviceController = require('./controllers/devices');
let userController = require('./controllers/users');
app.use('/devices', deviceController);
app.use('/users', userController);


module.exports = {app, logger};