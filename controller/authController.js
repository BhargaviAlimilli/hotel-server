const User= require('./../model/userModel')
const jwt= require('jsonwebtoken')
const {promisify}= require('util')
const { nextTick } = require('process')

exports.login= async (req,res)=>{
    console.log(req.body)
    try{
        if(!req.body.email) return res.status(400).send("please provide email to login")
        if(!req.body.password) return res.status(400).send("please provide password to login")
        let userExist = await User.findOne({ email:req.body.email }).exec()
        // console.log(userExist.id)
        if (!userExist) return res.status(400).send("No user registered on this email, please try with registered email.")
        if(!await userExist.correctPassword(req.body.password, userExist.password)) return res.status(400).send("Wrong password.")
        
        const token= jwt.sign({_id: userExist.id}, process.env.SECRET_KEY)

        res.status(200).json({
            status:"success",
            token,
            user:userExist
        })
    }catch(err){
        res.status(400).send("Something went wrong, try again.")
        console.log("Error", err)
    }
}

exports.register= async (req,res)=>{
    console.log(req.body)
    try{
        if(!req.body.name) return res.status(400).send("please provide name")
        if(!req.body.email) return res.status(400).send("please provide email")
        if(!req.body.password) return res.status(400).send("please provide password")
        if(req.body.password.length < 6) return res.status(400).send("password length should be more than 6")
        let userExist = await User.findOne({ email:req.body.email }).exec()
        if (userExist) return res.status(400).send("Email is already in use. Try with different Email.")

        const user= await User.create(req.body)
        console.log(user)
        res.status(200).send( "Succesfully Registered. please Login" )   

    }catch(err){
        res.status(400).send("Something went wrong, try again.")
        console.log("Error", err)
    }
}


exports.isLoggedin= (req,res,next)=>{
    const token = req.headers.authorization.split(' ')[1]
    // console.log(token)  
   const user=  jwt.verify(token,process.env.SECRET_KEY)
   req.user=user
   next()
}



