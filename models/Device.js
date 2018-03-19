const mongoose = require('mongoose');
const joi = require('joi');
const joigoose = require('joigoose')(mongoose);

// Allowed OS values for 'model'
// It must be a REGEX because joi's force uppercase only proccess after the expressions
const MODELS = /^ANDROID|IOS$/;

const DeviceJoiSchema = joi.object().keys({
  user_id: joi.string().required(),
  name: joi.string().required(),
  model: joi.string().uppercase({ force: true }).regex(/^ANDROID|IOS$/).required(),
  date_added: joi.date()
})

// Mongoose Schema, converted from joi
const DeviceMongooseSchema = new mongoose.Schema(joigoose.convert(DeviceJoiSchema)); 
const DeviceModel = mongoose.model('Device', DeviceMongooseSchema);

// Exporting the mongoose model and joi schema
module.exports = { DeviceModel, DeviceJoiSchema }