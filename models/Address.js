const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
  id:String,
  userId:String,
  name:String,
  phone:String,
  address:String,
  city:String,
  pincode:Number
})

module.exports = mongoose.model('Address', addressSchema);
