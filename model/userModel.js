const mongoose= require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema= new mongoose.Schema({
    name:{
        type: String,
        required:[true, "Name is required"],
        trim:true
    },
    email:{
        type:String,
        required:[true, "Email is required"],
        unique:true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        min: 6,
        max: 64
    },
    stripe_account_id: "",
    stripe_seller: {},
    stripeSession: {}
    },
    { timestamps: true }
)

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next()
    this.password= await bcrypt.hash(this.password,12)
})

userSchema.methods.correctPassword= async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword)
}

const User= mongoose.model('User', userSchema)
module.exports= User