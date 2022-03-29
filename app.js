const express= require('express')
const authRouter= require('./routes/authRoute')
const stripeRouter= require('./routes/stripeRoute')
const app= express()
const cors= require('cors')
const morgan= require('morgan')
const hotelRouter= require('./routes/hotelRoute')

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.get('/', (req,res)=>{
    res.status(200).send("hello there")
})

app.use('/api', authRouter)
app.use('/api/stripe', stripeRouter)
app.use('/api/hotel', hotelRouter)


module.exports= app