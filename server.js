'use strict';

const app = require('./app');
const port = process.env.PORT || 3000;
const logger = require('./logger');

// Database connection
require('./db-connection')();

const server = app.listen(port, function() {
  logger.info('Server listening on port ' + port);
});