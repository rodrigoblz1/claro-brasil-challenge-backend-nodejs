'use strict';

require('dotenv').config();
const config = require('./config');
const logger = require('./logger');

// Database connection
require('./db-connection')(logger, config);

const express = require('express');
const app = express();

module.exports = {app, logger};