const app = require('./app')
const {config} = require('dotenv')
config({path: './config.env'})
const mongoose= require('mongoose')
console.log('hello from the server........')
const database= process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(database).then(()=>{
    console.log("Database connection successful")
}).catch((err)=>{
    console.log("Database ERROR: ", err)
})

app.listen(process.env.PORT, ()=>{
    console.log(`server running on port ${process.env.PORT}`)
})
