const express= require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const sharp = require('sharp')
const {sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')
const router = new express.Router()


router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) =>{
  try{
     const user= await User.findByCredentials(req.body.email, req.body.password)
     const token = await user.generateAuthToken()

     res.send({user,token})
  }
  catch(e)
  {
        res.status(400).send()
  }
})

router.post('/users/logout',auth,async (req,res) =>{
  try{
    req.user.tokens = req.user.tokens.filter((token)=>{
    return token.token!=req.token
    })
    await req.user.save()

    res.send()
  }
  catch(e){
        res.status(500).send()
  }
})

router.post('/users/logoutAll' , auth , async(req,res) =>{
  try{
    req.user.tokens =[]
    await req.user.save()
    res.send()
  }
  catch(e){
    res.status(500).send()
  }
})
router.get('/users/me', auth ,async (req, res) => {
    res.send(req.user)
})


router.delete('/users/me',auth, async(req,res) =>{
  try{
    // const user= await User.findByIdAndDelete(req.user._id)
    //
    // if(!user)
    // {
    //   return res.status(404).send()
    // }
    await req.user.remove()
    sendCancellationEmail(req.user.email, req.user.name)
     res.send(req.user)
  }
   catch(e)
   {
     res.status(500).send()
   }
})

router.patch('/users/me',auth, async(req,res) =>{
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name' ,'email','password','age']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if(!isValidOperation){
    return res.status(400).send({error: 'Invalid Updates'})
  }
  try{
    //const user = await User.findByIdAndUpdate(req.params.id,req.body,{  new:true,  runValidators: true})
  //  const user = await User.findById(req.params.id)

    updates.forEach((update) =>{
      req.user[update] = req.body[update]

    })
    await req.user.save()
     // if(!user)
     // {
     //   return res.status(404).send()
     // }
      res.send(req.user)
  }
  catch(e) {
    res.status(400).send(e)
  }
})
const multer = require('multer')
const upload = multer({
  limits:{
    fileSize:100000000
  },
  fileFilter(req,file,cb)
  {
     if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
     {
        cb(new Error('File must be a image!! '))
    }
  cb(undefined,true)
}
})

router.post('/users/me/avatars' ,auth, upload.single('avatars'),  async (req,res) =>{
  const buffer = await sharp(req.file.buffer).resize({ height: 250,  width: 250}).png().toBuffer()
 req.user.avatar= buffer
  await  req.user.save()
  res.send()
}, (error,req,res,next) => {
  res.status(400).send({error: error.message})
})

router.delete('/users/me/avatars', auth, async(req,res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
})

router.get('/users/:id/avatars', async(req,res) =>{
  try{
    const user = await User.findById(req.params.id)

    if(!user|| !user.avatar){
      throw new Error()
    }

    res.set('Content-type','image/png')
    res.send(user.avatar)
  }
  catch(e){
    res.status(404).send()
  }
})
module.exports = router
