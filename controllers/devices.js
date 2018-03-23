'use strict';

const router = require('express').Router();

const { DeviceModel, DeviceJoiSchema, DeviceIdNameSchema } = require('../models/Device');
const UserModel = require('../models/User');

// Couting days as seconds for TESTS purposes, COMMENT THAT OUT
const day = 1000; // * 24 * 60 * 60

const MongoError = require('mongoose').Error;
const logger = require('../logger');


/**
 * @api {post} /devices/ Registra um novo device
 * @apiName RegisterDevice
 * @apiGroup Device
 * @apiVersion 0.0.1
 * 
 * @apiHeader Content-Type (application/json).
 * @apiParam {String} userId Identificador do usuário que está registrando o novo device
 * @apiParam {String} name Nome do dispositivo
 * @apiParam {String} model Serão permitidos apenas "Android" ou "iOS" (Case insensitive)
 * 
 * @apiSuccess {String} message Informações referentes ao resultado da operação.
 * @apiSuccess {Object} device Objeto que representa o novo device registrado
 *
 * @apiSuccessExample Success-Response:
{
    "message": "Device registered successfully",
    "device": {
        "_id": "5ab4f9e58ca814029f91da25",
        "userId": "123",
        "name": "iPhone de Rodrigo",
        "model": "IOS",
        "__v": 0
    }
}
 * @apiError BadRequest A requisição não pode ser processada.
 *
 * @apiErrorExample Error-Response:
 *  HTTP/1.1 400 Bad Request
{
    "message": "ValidationError: \"model\" with value \"Win Phone\" fails to match the required pattern: /^ANDROID|IOS$/"
}
 */
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

/**
 * @api {put} /devices/:id/:name Atualiza o nome de um device pelo seu id
 * @apiName UpdateDeviceName
 * @apiGroup Device
 * @apiVersion 0.0.1
 * 
 * @apiSuccess {String} message Informações referentes ao resultado da operação.
 * @apiSuccess {Object} device Objeto que representa o device atualizado
 *
 * @apiSuccessExample Success-Response:
{
    "message": "Device updated successfully",
    "device": {
        "_id": "5ab467beeca66c249c53f52e",
        "userId": "123",
        "name": "Novo iPhone",
        "model": "IOS",
        "__v": 0
    }
}
 * @apiError BadRequest A requisição não pode ser processada.
 *
 * @apiErrorExample Error-Response:
 *  HTTP/1.1 400 Bad Request
{
    "message": "Device not found"
}
 */
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

/**
 * @api {delete} /devices/:id Deleta um device pelo seu id
 * @apiName DeleteDevice
 * @apiGroup Device
 * @apiVersion 0.0.1
 * 
 * @apiSuccess {String} message Informações referentes ao resultado da operação.
 * @apiSuccess {Object} device Objeto que representa o device atualizado
 *
 * @apiSuccessExample Success-Response:
{
    "message": "Device iPhone Novo was removed successfully"
}
 * @apiError BadRequest A requisição não pode ser processada.
 *
 * @apiErrorExample Error-Response:
 *  HTTP/1.1 400 Bad Request
{
    "message": "You can't delete your last device because you will not be able to add a new one at the moment.
    You can register a new device only after Fri Mar 23 2018 10:05:48 GMT-0300 (-03)"
}
 */
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
  logger.error(error);
  next(error);
});


module.exports = router;