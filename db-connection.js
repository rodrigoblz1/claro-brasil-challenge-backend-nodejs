'use strict';

const logger = require('./logger');
const config = require('./config');
const mongoose = require('mongoose');

module.exports = async () => {
  try {
    await mongoose.connect(config.database.uri, {
      keepAlive: true, 
      reconnectTries: Number.MAX_VALUE // Never stop trying to reconnect
    })
    logger.info('DB connected successfully!')
  } catch (err) {
    logger.error(err);
  }
}