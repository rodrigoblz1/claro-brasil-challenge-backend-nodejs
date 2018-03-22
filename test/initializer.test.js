require('dotenv').config();
const config = require('../config');
const mongoose = require('mongoose');

before(async () => {
    try {
      // We are using a database only for testing purposes
      await mongoose.connect(config.database.uri);
      console.log('Connected to MongoDB!');
    }
    catch (error) {
      console.log('Connection error : ', error);
    }
});
 
beforeEach(async () => {
  try{
    // Before each test, we get all the collections and drop then
    // Like this, we ensure no 'ns not found' exception is thrown and keep it safer
    let colls = await mongoose.connection.db.listCollections({name: 'devices'}).toArray();
    for (let coll of colls) {
      await mongoose.connection.collections[coll.name].drop();
    }
  } catch (error) {
    console.log('Dropping collection error: ', error);
  } 
});

after(async () => {
  mongoose.connection.close();
});