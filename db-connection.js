'use strict';

const mongoose = require('mongoose');

module.exports = async (logger, config) => {
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