'use strict';

const router = require('express').Router();

const { DeviceModel } = require('../models/Device');
const UserModel = require('../models/User');

router.get('/:userId/devices/', async (req, res) => {
  try {
    let devices = await DeviceModel.find({userId: req.params.userId});
    res.status(200).send(devices);
  } catch (error) {
    return res.status(500).json({
      type: 'Server Error',
      message: 'Try again another time'
    });
  }
});

module.exports = router;
