const mongoose = require('mongoose');
const joi = require('joi');
const joigoose = require('joigoose')(mongoose);

// Allowed OS values for 'model'
const MODELS = ['Android', 'iOS'];

const DeviceJoiSchema = joi.object().keys({
  user_id: joi.string().required(),
  name: joi.string().required(),
  model: joi.string().valid(MODELS).required(),
  date_added: joi.date()
})

// Mongoose Schema, converted from joi
const DeviceMongooseSchema = new mongoose.Schema(joigoose.convert(DeviceJoiSchema)); 
const DeviceModel = mongoose.model('Device', DeviceMongooseSchema);

// Exporting the mongoose model and joi schema
module.exports = { DeviceModel, DeviceJoiSchema }