const mongoose = require('mongoose')

const graphicsSchema = new mongoose.Schema({
  id:String,
  name:String,
  series:String,
  description:String,
  features:String,
  price:Number,
  discount:Number,
  isOverClock:Boolean,
  isAvailable:Boolean
})
//module.exports = graphicsSchema;
module.exports = mongoose.model('Graphics', graphicsSchema);
