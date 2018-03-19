/**
 * Basic configuration object
 */
module.exports = Object.freeze({
  database: {
    uri: 'mongodb://' 
    + process.env.DB_USER + ':' 
    + process.env.DB_PASSWORD + '@' + ((process.env.NODE_ENV === 'testing') ? process.env.DB_TEST : process.env.DB_PROD)
  }
});