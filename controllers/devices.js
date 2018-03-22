'use strict';

const router = require('express').Router();

const { DeviceModel, DeviceJoiSchema, DevicePutNameSchema } = require('../models/Device');
const UserModel = require('../models/User');

const { Error, TypeError } = require('mongoose');

// Couting days as seconds for TESTS purposes, COMMENT THAT OUT
const day = 1000; // * 24 * 60 * 60

// CREATES A NEW DEVICE
router.post('/', wrapAsync(async (req, res) => {
  // Validates the whole body, if it matches the requirements 
  let deviceJoi = await DeviceJoiSchema.validate(req.body);
  
  // Retrieves the user
  let user = await usersController.getUserById(req.body.userId);

  // Get all the user devices, sorted by olders first
  let userDevices = await DeviceModel.find({userId: user.id}).sort({date_added: 1})

  // 30 days back from now
  let timestamp = new Date().getTime() - (30 * day);

  // User already have 3 devices
  if (userDevices.length === 3) {
    let message = 'You have reached the maximum of devices per account';
    // Checks if its last exchange was made before that
    if (!user.last_exchange || user.last_exchange < timestamp) {
      // In this case, the user cannot register a new device
      message += '\nBut you can make an exchange (delete than add a new one)';
    } else {
      let newExchangeDate = new Date(user.last_exchange.getTime() + (30 * day));
      message += '\nYour next exchange will be available at ' + newExchangeDate;
    }
    return res.status(400).send({
      message: message 
    });
  }

  // User exchanges validation
  if (user.last_exchange > timestamp) {
    let newExchangeDate = new Date(user.last_exchange.getTime() + (30 * day));
    return res.status(400).send({
      message: 'You can register a new device at ' + newExchangeDate
    });
  }

  // This object will be used to modify the stored user, it will initially increment the total of devices
  let userModifierObject = {total_registered: user.total_registered + 1};

  // The user is 'making an exchange' now
  if (user.total_registered >= 3) {
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
  let deviceIdAndName = await DevicePutNameSchema.validate(req.params);
  let device = await DeviceModel.findByIdAndUpdate(deviceIdAndName.id, {
    $set: {name: deviceIdAndName.name}
  });
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

// HELPER FUNCTIONS
let getUserById = async (userId) => {
  // Mocked part: The system approuch needs a user stored to manage the device exchange dates
  // So we create one if it doesn't exist
  try {
    let user = await UserModel.findOne({id: userId});
    if (!user) {
      user = await new UserModel({id: userId}).save();
    }
    return user;
  } catch (error) {
    throw error;
  }
}

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
  if (error instanceof Error || error instanceof TypeError) {
    return res.status(503).json({
      type: 'Database error',
      message: error.message
    });
  }
  next(error);
});

router.use(function generalErrors(error, req, res, next) {
  return res.status(500).json({
    type: 'Server Error',
    message: 'Try again another time'
  });
});

module.exports = router;