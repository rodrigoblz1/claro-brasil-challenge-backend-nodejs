'use strict';

const router = require('express').Router();

const { DeviceModel, DeviceJoiSchema } = require('../models/Device');
const usersController = require('./users');

// Couting days as seconds for TESTS purposes, COMMENT THAT OUT
const day = 1000; // * 24 * 60 * 60

// CREATES A NEW DEVICE
router.post('/', async (req, res) => {
  try{
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
      return res.status(400).send(message);
    }

    // User exchanges validation
    if (user.last_exchange > timestamp) {
      let newExchangeDate = new Date(user.last_exchange.getTime() + (30 * day));
      return res.status(400).send('You can register a new device at ' + newExchangeDate);
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
    return res.status(200).send('The device have been registered successfully');
  } catch (error) {
    if (error.isJoi){
      return res.status(400).send(error.name + ': ' + error.details.map(e => e.message));
    }
    return res.status(500).send(error.message || 'Unknown error, please contact the administration');
  }
});

module.exports = router;