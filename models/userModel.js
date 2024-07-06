const mongoose = require('mongoose');

const user = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: Number, required: true },
  password: { type: String, required: true },

});

module.exports = mongoose.model('User', user);