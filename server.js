const express = require('express')
const app = express()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const uuid =  require('uuid')
const path =  require('path')
const cors = require('cors');
dotenv.config()
app.set('view engine','ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set('views', path.join(__dirname, 'views'));

const Graphics =  require('./models/GraphicsCard')


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


app.listen(5000,()=>{
  console.log('serer is working...')
})
