const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let UserSchema = new Schema({
  id: String,
  last_exchange: Date,
  total_registered: {
    type: Number,
    default: 0
  }
}); 

module.exports = mongoose.model('User', UserSchema);