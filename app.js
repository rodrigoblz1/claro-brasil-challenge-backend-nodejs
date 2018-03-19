'use strict';

require('dotenv').config();
const config = require('./config');
const logger = require('./logger');
const db = require('./database')(logger, config);

const express = require('express');
const app = express();

module.exports = {app, logger};