'use strict';

const router = require('express').Router();

const { DeviceModel } = require('../models/Device');
const UserModel = require('../models/User');

/**
 * @api {get} /users/:userId/devices/ Recupera a lista de devices pelo id do usuário
 * @apiName GetDevices
 * @apiGroup User
 * @apiVersion 0.0.1
 * 
 * @apiSuccess {String} message Informações referentes ao resultado da operação.
 * @apiSuccess {Array} devices Lista com os devices do usuário
 *
 * @apiSuccessExample Success-Response:
{
    "message": "Devices retrieved successfully",
    "devices": [
        {
            "_id": "5ab4f9e58ca814029f91da25",
            "userId": "123",
            "name": "iPhone 1",
            "model": "IOS",
            "__v": 0
        },
        {
            "_id": "5ab4fc608ca814029f91da28",
            "userId": "123",
            "name": "Android 1",
            "model": "ANDROID",
            "__v": 0
        }
    ]
}
 * @apiError BadRequest A requisição não pode ser processada.
 *
 * @apiErrorExample Error-Response:
 *  HTTP/1.1 400 Bad Request
{
    "message": "No devices were found for the given user"
}
 */
router.get('/:userId/devices/', async (req, res) => {
  try {
    let devices = await DeviceModel.find({userId: req.params.userId});
    if (devices.length) {
      res.status(200).send({
        message: 'Devices retrieved successfully',
        devices: devices
      });
    } else {
      res.status(400).send({
        message: 'No devices were found for the given user'
      });
    }
  } catch (error) {
    return res.status(500).json({
      type: 'Server Error',
      message: 'Try again another time'
    });
  }
});

module.exports = router;
