const express= require('express')
const stripeController =require('./../controller/stripeController')
const authController = require('./../controller/authController')

const router= express.Router()

router.route('/create-connect-account').post(authController.isLoggedin,stripeController.createStripeAcc)
router.route('/get-account-status').post(authController.isLoggedin, stripeController.getAccStatus)
router.route('/get-account-balance').post(authController.isLoggedin, stripeController.getAccBalance)
// router.route('/payout-setting').post(authController.isLoggedin, stripeController.payoutSetting)
router.route('/stripe-session').post(authController.isLoggedin, stripeController.stripeSessionId)
router.route("/stripe-success").post(authController.isLoggedin, stripeController.stripeSuccess)

module.exports= router

