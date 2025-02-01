const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema({
  id:String,
  name: String,
  email:String
});
const addressSchema = new mongoose.Schema({
  address: String,
  city:String,
  pincode:Number,
  name:String,
  phone:String
});

const productSchema = new mongoose.Schema({
  id:String,
  name:String,
  series:String,
  description:String,
  features:String,
  price:Number,
  discount:Number,
  isOverClock:Boolean,
  isAvailable:Boolean
});
const orderSchema = new mongoose.Schema({
  id:String,
  order_id:String,
  payment_id:String,
  signature:String,
  customer:{
    type:customerSchema,
    required:true
  },
  address:{
    type:addressSchema,
    required:true
  },
  products:{
    type:[productSchema]
  },
  status:{
    type:String,
    default:'Pending'
  },
  amount:{
    type:Number,
    required:true
  },
  isCancelled:{
    type:Boolean,
    default:false
  },
  isReturned:{
    type:Boolean,
    default:false
  }
})

module.exports = mongoose.model('Order', orderSchema);
