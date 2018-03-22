'use strict';

const router = require('express').Router();

const { DeviceModel, DeviceJoiSchema, DeviceIdNameSchema } = require('../models/Device');
const UserModel = require('../models/User');

const MongoError = require('mongoose').Error;

// Couting days as seconds for TESTS purposes, COMMENT THAT OUT
const day = 1000; // * 24 * 60 * 60

// CREATES A NEW DEVICE
router.post('/', wrapAsync(async (req, res) => {
  // Validates the whole body, if it matches the requirements 
  let deviceJoi = await DeviceJoiSchema.validate(req.body);
  
  // Retrieves the user
  let user = await UserModel.findOne({id: deviceJoi.userId});
  if (!user) {
    // The system approuch needs a user stored to manage the device exchange dates
    // So we abstract its registration and create one if it doesn't exist
    user = await new UserModel({id: deviceJoi.userId}).save();
  }

  // 30 days back from now
  let timestamp = new Date().getTime() - (30 * day);

  // User already have 3 devices
  if (user.current_devices_amount === 3) {
    let message = 'You have reached the maximum of devices per account';
    // Checks if its last exchange was made before that
    if (!user.last_exchange || user.last_exchange < timestamp) {
      // In this case, the user cannot register a new device
      message += '. But you can make an exchange (delete than add a new one)';
    } else {
      let newExchangeDate = new Date(user.last_exchange.getTime() + (30 * day));
      message += '. Your next exchange will be available at ' + newExchangeDate;
    }
    return res.status(400).send({
      message: message 
    });
  }

  // User exchanges validation
  if (user.last_exchange > timestamp) {
    let newExchangeDate = new Date(user.last_exchange.getTime() + (30 * day));
    return res.status(400).send({
      message: 'You can register a new device only after ' + newExchangeDate
    });
  }

  // This object will be used to modify the stored user, it will initially increment the total of devices
  let userModifierObject = {
    total_devices_registered: user.total_devices_registered + 1,
    current_devices_amount: user.current_devices_amount + 1,
  };

  // The user is 'making an exchange' now
  if (user.total_devices_registered >= 3) {
    // Will set the new 'last_enchange' date to the modifier object
    userModifierObject.last_exchange = new Date();
  }
  let device = new DeviceModel(deviceJoi);
  //applying the modifications to the user
  await user.update({$set: userModifierObject});
  await device.save();
  return res.status(200).send({
    message: 'Device registered successfully',
    device: device
  });
}));

router.put('/:id/:name', wrapAsync(async (req, res) => {
  let deviceIdAndName = await DeviceIdNameSchema.validate(req.params);
  let device = await DeviceModel.findByIdAndUpdate(deviceIdAndName.id, {
    $set: {name: deviceIdAndName.name}
  }, {new: true});
  if (!device) {
    return res.status(400).send({
      message: 'Device not found'
    });
  }
  res.status(200).send({
    message: 'Device updated successfully',
    device: device
  });
}));


router.delete('/:id', wrapAsync(async (req, res) => {
  let device = await DeviceModel.findById(req.params.id);
  if (!device) {
    return res.status(400).send({
      message: 'Device not found'
    });
  }
  let user = await UserModel.findOne({id: device.userId});
  
  // 30 days back from now
  let timestamp = new Date().getTime() - (30 * day);
  // Last user device and an exchange can't be made
  if (user.current_devices_amount === 1 && user.last_exchange > timestamp) {
    let newExchangeDate = new Date(user.last_exchange.getTime() + (30 * day));
    return res.status(400).send({
      message: 'You can\'t delete your last device because you will not be able to add a new one at the moment'
      + '. You can register a new device only after ' + newExchangeDate
    });
  }
  await user.update({$inc: {current_devices_amount: -1}});
  await device.remove();
  res.status(200).send({
    message: 'Device ' + device.name + ' was removed successfully'
  });
}));

// ERROR HANDLING
function wrapAsync(fn) {
  return function(req, res, next) {
    fn(req, res, next).catch(next);
  };
}

router.use(function handleJoiError(error, req, res, next) {
  if (error.isJoi) {
    return res.status(400).send({
      message: error.name + ': ' + error.details.map(e => e.message)
    });
  }
  next(error);
});

router.use(function handleDatabaseError(error, req, res, next) {
  if (error instanceof MongoError) {
    return res.status(503).json({
      type: 'Database error',
      message: error.message
    });
  }
  next(error);
});

router.use(function generalErrors(error, req, res, next) {
  console.log(error);
  return res.status(500).json({
    type: 'Server Error',
    message: 'Try again another time'
  });
});

module.exports = router;