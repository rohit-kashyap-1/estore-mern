const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema({
  id:String,
  name:String,
  email:String,
  password:String
})

module.exports = mongoose.model('Customer', customerSchema);
