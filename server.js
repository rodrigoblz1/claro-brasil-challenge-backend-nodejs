'use strict';

const {app, logger} = require('./app');
const port = process.env.PORT || 3000;

const server = app.listen(port, function() {
  logger.info('Server listening on port ' + port);
});