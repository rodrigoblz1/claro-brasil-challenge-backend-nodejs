'use strict';

const User = require('../models/User');

module.exports.getUserById = async (userId) => {
  // Mocked part: The system approuch needs a user stored to manage the device exchange dates
  // So we create one if it doesn't exist
  try {
    let user = await User.findOne({id: userId});
    if (!user) {
      user = await new User({id: userId}).save();
    }
    return user;
  } catch (error) {
    throw error;
  }
}