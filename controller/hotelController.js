const Hotel= require('./../model/hotelModel.js')
const fs= require('fs')
const Order= require('./../model/orderModel')


exports.hotelOwner = async (req, res, next) => {
  let hotel = await Hotel.findById(req.params.hotelId).exec();
  let owner = hotel.postedBy._id.toString() === req.user._id.toString();
  if (!owner) {
    return res.status(403).send("Unauthorized");
  }
  next();
};

exports.create = async (req, res) => {
  //   console.log("req.fields", req.fields);
  //   console.log("req.files", req.files);
  try {
    let fields = req.fields;
    let files = req.files;

    let hotel = new Hotel(fields);
    hotel.postedBy = req.user._id;
    // handle image
    if (files.image) {
      hotel.image.data = fs.readFileSync(files.image.path);
      hotel.image.contentType = files.image.type;
    }

    hotel.save((err, result) => {
      if (err) {
        console.log("saving hotel err => ", err);
        res.status(400).send("Error saving");
      }
      res.json(result);
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      err: err.message,
    });
  }
};

exports.hotels = async (req, res) => {
  let all = await Hotel.find({})
    .limit(24)
    .select("-image.data")
    .populate("postedBy", "_id name")
    .exec();
  // console.log(all);
  res.json(all);
};

exports.image = async (req, res) => {
  let hotel = await Hotel.findById(req.params.hotelId).exec();
  if (hotel && hotel.image && hotel.image.data !== null) {
    res.set("Content-Type", hotel.image.contentType);
    return res.send(hotel.image.data);
  }
};

exports.ownerHotels= async(req,res)=>{
  let user= req.user
  console.log(user, "user details..........")
  const hotels= await Hotel.find({postedBy: user._id}).select("-image.data")
  // console.log("seller hotels...", hotels )
  res.send(hotels)
}

exports.remove = async (req, res) => {
  let removed = await Hotel.findByIdAndDelete(req.params.hotelId)
    .select("-image.data")
    .exec();
  res.json(removed);
};

exports.read = async (req, res) => {
  let hotel = await Hotel.findById(req.params.hotelId)
    .select("-image.data").populate("postedBy", "_id name")
    .exec();
  console.log("SINGLE HOTEL", hotel);
  res.json(hotel);
};

exports.update = async (req, res) => {
  try {
    let fields = req.fields;
    let files = req.files;

    let data = { ...fields };
   
    if (files.image) {
      let image = {};
      image.data = fs.readFileSync(files.image.path);
      image.contentType = files.image.type;

      data.image = image;

    }

    let updated = await Hotel.findByIdAndUpdate(req.params.hotelId, data, {
      new: true,
    }).select("-image.data");

    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(400).send("Hotel update failed. Try again.");
  }
};

exports.userBookings= async(req,res)=>{
  console.log(req.user)
  const all = await Order.find({ orderedBy: req.user._id })
    .select("session")
    .populate("hotel", "-image.data")
    .populate("orderedBy", "_id name")
    .exec();
  res.json(all);
}

exports.searchHotel= async(req,res)=>{
  console.log(req.body)
  const { location, date, bed } = req.body;
  const fromDate = date.split(",");
  console.log(fromDate[1])
  // console.log(fromDate[0]);
  // db.posts.find({"created_on": {"$gte": new Date(2012, 7, 14), "$lt": new Date(2012, 7, 15)}})
  let result = await Hotel.find({
    from: { $lte: new Date(fromDate[0]) },
    to:{$gte: new Date(fromDate[1])},
    location,
  })
    .select("-image.data")
    .exec();
  // console.log("SEARCH LISTINGS", result);
  res.json(result);
};

//db.posts.find({"created_on": {"$gte": new Date(2012, 7, 14), "$lt": new Date(2012, 7, 15)}})





//   const fromDate = date.split(",")[0];
//   console.log(fromDate);
//   const toDate=date.split(',')[1]
//   console.log(toDate)
//   console.log( new Date(fromDate) )
//   console.log( new Date(toDate) )

//   let result = await Hotel.find({
//     location
//   })
//     .select("-image.data")
//     .exec();
//   console.log(result[0])
//   console.log(result[1], "........")
//   console.log("SEARCH LISTINGS", result)
//   console.log(result.length)
//   console.log((new Date(fromDate) >= result[0].from))
//   console.log( new Date(toDate)<=result[0].to )
//   console.log((new Date(fromDate) >= result[1].from))
//   console.log( new Date(toDate)<=result[1].to )

//   let final
//   let ress= result.map((hotels, index)=>{
//     if((new Date(fromDate) >= hotels[index].from)  && (new Date(toDate)<=hotels[index].to)){     
//       final= result[index]
//       console.log(final)
//     }
//   })
//   console.log(ress)
// }


// //   if(result){
// //     let final
// //     for(let i= 0; i<=result.length; i++){
// //       if((new Date(fromDate) >= result[i].from)  && (new Date(toDate)<=result[i].to)){     
// //         final= result[i]
// //         console.log(final)
// //       }
// //       console.log(".............", final)
// //     } 
// //   }
// // else(
// //   res.json({
// //     res:"no hotels"
// //   })
// //   )
// // }


