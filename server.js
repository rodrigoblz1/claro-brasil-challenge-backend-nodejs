'use strict';

const {app, logger} = require('./app');
const config = require('./config');
const port = process.env.PORT || 3000;

// Database connection
require('./db-connection')(logger, config);

const server = app.listen(port, function() {
  logger.info('Server listening on port ' + port);
});