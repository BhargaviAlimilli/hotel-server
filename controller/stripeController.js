const User= require('./../model/userModel')
const queryString= require('query-string')
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51KhpDESJAEAUfWaOH5CGI0jjehoOuYPU5UtIKmrxSAfGiGOPBS9oOQWcysZJJAmueCmeuIxNjh9axykFdKXoH5Qa00vvqYC9wM');
const Hotel = require('./../model/hotelModel')
const Order = require('./../model/orderModel')

exports.createStripeAcc= async (req,res)=>{
  const user = await User.findById(req.user._id).exec();
  if (!user.stripe_account_id) {
    const account = await stripe.accounts.create({
      type: "standard",
    }); // account creation
    console.log("from stripe account");
    user.stripe_account_id = account.id;
    user.save();
  }
  //login link 
  let accountLink = await stripe.accountLinks.create({
    account: user.stripe_account_id,
    refresh_url:process.env.STRIPE_REDIRECT_URL,
    return_url:process.env.STRIPE_REDIRECT_URL,
    type: "account_onboarding",
  });
  accountLink = Object.assign(accountLink, {
    "stripe_user[email]": user.email || undefined,
  });
  let link = `${accountLink.url}?${queryString.stringify(accountLink)}`;
  console.log("LOGIN LINK: ", link);
  res.status(200).send(link);
}

// const updateDelayDays = async (accountId) => {
//   const account = await stripe.accounts.update(accountId, {
//     settings: {
//       payouts: {
//         schedule: {
//           delay_days: 7,
//         },
//       },
//     },
//   });
//   return account
// }

exports.getAccStatus=async(req,res)=>{
  const user = await User.findById(req.user._id).exec();
  console.log("..................", user)
  const account = await stripe.accounts.retrieve(user.stripe_account_id);
  console.log("USER ACCOUNT RETRIEVE", account);
  // const updatedAccount = await updateDelayDays(account.id);
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      stripe_seller: account,
    },
    { new: true }
  )
    .select("-password")
    .exec();
  console.log(updatedUser);
  res.json(updatedUser);
}

exports.getAccBalance= async(req,res)=>{
  const user = await User.findById(req.user._id).exec();
  try{
    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripe_account_id,
    })
    // console.log("BALANCE ===>", balance);
    res.json(balance)
  }catch(err){
    console.log("Error", err)
  }
}

// exports.payoutSetting = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).exec()
//     if(user.stripe_seller.settings.type==="standard"){
//       res.send("Stripe payouts settings not available in Indian region")
//     }
//     const loginLink = await stripe.accounts.createLoginLink(
//       user.stripe_account_id,
//       {
//         redirect_url: process.env.STRIPE_SETTING_REDIRECT_URL,
//       }
//     )
//     console.log("LOGIN LINK FOR PAYOUT SETTING", loginLink);
//     res.json(loginLink)
//   } catch (err) {
//     console.log("STRIPE PAYOUT SETTING ERR ", err)
//   }
// }

exports.stripeSessionId = async (req, res) => {
  // console.log("you hit stripe session id", req.body.hotelId);
  const hotelId= req.body.hotelId

  const hotel = await Hotel.findById(hotelId).populate("postedBy").exec()
  const stripeFee= (hotel.price*20)/100
  console.log(stripeFee)
  console.log(hotel.postedBy.stripe_account_id)

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        name: hotel.title,
        amount: hotel.price*100,
        currency: "inr",
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: stripeFee,
      transfer_data: {
        destination: hotel.postedBy.stripe_account_id,
      },
    },
    success_url: `${process.env.STRIPE_SUCCESS_URL}/${hotel._id}`,
    cancel_url: process.env.STRIPE_CANCEL_URL,
  });

  await User.findByIdAndUpdate(req.user._id, { stripeSession: session }).exec()
  res.send({
    sessionId: session.id,
  });

  console.log("SESSION =====> ", session);
};

exports.stripeSuccess = async (req, res) => {
  try {
    // 1 get hotel id from req.body
    const { hotelId } = req.body;
    // 2 find currently logged in user
    const user = await User.findById(req.user._id).exec();
    // check if user has stripeSession
    if (!user.stripeSession) return;
    // 3 retrieve stripe session, based on session id we previously save in user db
    const session = await stripe.checkout.sessions.retrieve(
      user.stripeSession.id
    );
    // 4 if session payment status is paid, create order
    if (session.payment_status === "paid") {
      // 5 check if order with that session id already exist by querying orders collection
      const orderExist = await Order.findOne({
        "session.id": session.id,
      }).exec();
      if (orderExist) {
        // 6 if order exist, send success true
        res.json({ success: true });
      } else {
        // 7 else create new order and send success true
        let newOrder = await new Order({
          hotel: hotelId,
          session,
          orderedBy: user._id,
        }).save();
        // 8 remove user's stripeSession
        await User.findByIdAndUpdate(user._id, {
          $set: { stripeSession: {} },
        });
        res.json({ success: true });
      }
    }
  } catch (err) {
    console.log("STRIPE SUCCESS ERR", err);
  }};

