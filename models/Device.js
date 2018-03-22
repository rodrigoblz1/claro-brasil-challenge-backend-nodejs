const mongoose = require('mongoose');
const joi = require('joi');
joi.objectId = require('joi-objectid')(joi);
const joigoose = require('joigoose')(mongoose);

// Allowed OS values for 'model'
// It must be a REGEX because joi's force uppercase only proccess after the expressions
const MODELS = /^ANDROID|IOS$/;

const name = joi.string().max(50).required();

// Used for device registration
let DeviceJoiSchema = joi.object().keys({
  userId: joi.string().required(),
  name: name,
  model: joi.string().uppercase({ force: true }).regex(/^ANDROID|IOS$/).required(),
  date_added: joi.date()
})

// Used for device update
let DevicePutNameSchema = joi.object().keys({
  id: joi.objectId().label('Invalid objectId'),
  name: name
})

// Mongoose Schema, converted from joi
let DeviceMongooseSchema = new mongoose.Schema(joigoose.convert(DeviceJoiSchema));
let DeviceModel = mongoose.model('Device', DeviceMongooseSchema);

// Exporting the mongoose model and joi schema
module.exports = { DeviceModel, DeviceJoiSchema, DevicePutNameSchema }