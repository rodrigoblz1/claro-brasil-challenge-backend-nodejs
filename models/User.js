const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let UserSchema = new Schema({
  id: String,
  last_exchange: Date,
  total_devices_registered: {
    type: Number,
    default: 0
  },
  current_devices_amount: {
    type: Number,
    default: 0
  }
}); 

module.exports = mongoose.model('User', UserSchema);