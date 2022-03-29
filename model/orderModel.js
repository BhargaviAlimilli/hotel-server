const mongoose= require('mongoose')

const orderSchema = new mongoose.Schema(
  {
    hotel: {
        type: mongoose.Schema.ObjectId,
        ref: "Hotel",
    },
    session: {},
    orderedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    }
  },
    { timestamps: true }
)

const Order= mongoose.model('Order', orderSchema)
module.exports= Order