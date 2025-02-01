const express = require('express')
const app = express()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const uuid =  require('uuid')
const path =  require('path')
const cors = require('cors');
const jwt =  require('jsonwebtoken')
dotenv.config()
app.set('view engine','ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set('views', path.join(__dirname, 'views'));

const Graphics =  require('./models/GraphicsCard')
const Customer = require('./models/Customer')
const Address =  require('./models/Address')
const Order = require('./models/Order')


//cors
const corsOptions = {
  origin: '*', // Replace with the React app's URL

};

app.use(cors(corsOptions));

//database connection
try {
  mongoose.connect(process.env.MONGO_URL).then(msg=>{console.log('connected')});
} catch (error) {
  handleError(error);
}

//database models
app.post('/create-graphics',(req,res)=>{
  const graphics = new Graphics();//table connect
  graphics.id = uuid.v4()
  if(req.body.name==null){
    return res.status(200).json({status:false,msg:'Please enter the graphic card name'})
  }
  graphics.name =  req.body.name
  graphics.series =  req.body.series //RTX 3050Ti
  graphics.description =  req.body.description
  graphics.features =  req.body.features
  graphics.price =  req.body.price
  graphics.discount =  req.body.discount
  graphics.isOverClock =  req.body.isOverclock
  graphics.available  =  req.body.available
  graphics.save()
  //res.status(200).json({status:true,'msg':'graphics card saved'})
  res.redirect('/set-graphic')
})

//list graphics
app.get('/list-graphics',(req,res)=>{
  async function fetchAllGraphics() {
    try {
      const graphics = await Graphics.find(); // Finds all documents in the Graphics Card collection
      res.render('graphics-list',{graphics:graphics})
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }
  fetchAllGraphics()


})

//containersd
//delete
app.get('/delete-graphics/:id',async (req,res)=>{
  const { id } = req.params; //moongoose object id
  const is_deleted = await Graphics.findByIdAndDelete(id); //{{ name:"", }}
  if(is_deleted){
    res.redirect('/list-graphics')
  }else{
    res.status(200).json({status:false,'msg':'Graphics card not deleted'})
  }
})
app.get('/set-graphic',(req,res)=>{
  res.render('graphics-form');
})

app.get('/', function (req, res) {
  const graphics = new Graphics()
  graphics.name =  'Demo'
  graphics.save()
  console.log(graphics)
  res.status(200).json({msg:'working'})
})


//google.com:8080
//8080


//api urls
app.get('/all-products',async (req,res)=>{
  const products =await Graphics.find()
  res.status(200).json(products)
})


//razor pay
app.post('/create-order',async (req,res)=>{
  const Razorpay = require('razorpay');
  var instance = new Razorpay({ key_id: 'rzp_test_Lt396pFHNPwyzS', key_secret: 'MSowQzJ6WHui3VfrluxO3TFt' })

  var options = {
    amount: req.body.amount,  // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    currency: "INR",
    receipt: uuid.v4()
  };
  instance.orders.create(options, function(err, order) {
    return res.status(200).json(order)
  });

})

//register customer
app.post('/register-customer',async (req,res)=>{
  const name = req.body.name
  const email =  req.body.email
  const password =  req.body.password
  const cnf_password = req.body.cnf_password
  if(!name){
   return res.json({type:false,msg:'Name can not be emptry'})
  }
  if(!email){
    return res.json({type:false,msg:'Email can not be emptry'})
   }
   if(!password  || password!=cnf_password){
    return res.json({type:false,msg:'Invalid Password or Password do no match'})
   }

   const customer = new Customer();//table connect
   customer.id = uuid.v4()
   customer.name =  name
   customer.email =  email
   customer.password  =  password
   customer.save()
   //customer registerd then generate a token and reeturn
   const token =  jwt.sign(
    {id:customer.id,name,email},
    process.env.TOKEN_SECRET,
    {expiresIn:process.env.DEFAULT_TOKEN_EXPIRE_TIME}
   )

   res.json({type:true,token:token})

})
//login customer
app.post('/login-customer',async (req,res)=>{
  const email = req.body.email
  const password = req.body.password
  const customer = await Customer.findOne({email:email,password:password})
  if(customer){
    //generate token
    const token =  jwt.sign(
      {id:customer.id,name:customer.name,email},
      process.env.TOKEN_SECRET,
      {expiresIn:process.env.DEFAULT_TOKEN_EXPIRE_TIME}
     )

     res.json({type:true,token:token})
  }else{
    //200
    return res.json({type:false,msg:'User not found'})
  }

})
//verify customer
app.post('/verify-customer',async (req,res)=>{
    const token = req.body.token
    //jwt verify
    if(token){
      const verify =  jwt.verify(token,process.env.TOKEN_SECRET)
      if(verify){
        return res.json({type:true,msg:'valid',userId:verify.id})
      }else{
        return res.json({type:false,msg:'Invalid Token'})
      }
    }else{
      return res.json({type:false,msg:'Invalid Token'})
    }
})



//address module
//register address
//deleted address
app.post('/add-address',async (req,res)=>{
  const name = req.body.name
  const phone =  req.body.phone
  const addresss = req.body.address
  const city = req.body.city
  const pincode = req.body.pincode
  const userId = req.body.userId

  //validation
  if(!name){
    return res.json({type:false,msg:'Name can not be emptry'})
  }
  //rest of the validation diy
  const address =  new Address()
  address.id = uuid.v4()
  address.userId = userId
  address.name = name
  address.phone = phone
  address.address = addresss
  address.city = city
  address.pincode = pincode
  address.save()
  return res.json({type:true,msg:'address added'})

})

app.post('/all-address',async (req,res)=>{
  const userId = req.body.userId
  const addresses = await Address.find({userId:userId})
  return res.json({type:true,addresses:addresses})
})
//
app.post('/place-order',async (req,res)=>{
  const customerId = req.body.customerId
  const addressId = req.body.addressId
  const paymentId = req.body.paymentId
  const orderId = req.body.orderId
  const signature = req.body.signature
  const amount = req.body.amount
  const products =  JSON.parse(req.body.products)
  //fetch userr based on user id
  //fetch address based on address id
  const customer = await Customer.findOne({id:customerId}).select('id name email -_id')
  const address = await Address.findOne({id:addressId}).select('address city pincode name phone -_id')
  const order  = new Order()
  order.id = uuid.v4()
  order.order_id =  orderId
  order.paymentId =  paymentId
  order.signature = signature
  order.customer = customer
  order.address = address
  order.amount = amount
  order.products =  products
  await order.save()
  if(order){
    return res.json({order:order,type:true,msg:'Order Successfully placed..'})
  }else{
    return res.json({type:false,msg:'Sorry, the order could not be place, if you have moneny deducted, it will be return back to your account in few days'})
  }



})
app.listen(5000,()=>{
  console.log('serer is working...')
})
