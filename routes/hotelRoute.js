const express= require('express')
const formidable= require("express-formidable")

const hotelController =require('./../controller/hotelController')
const authController = require('./../controller/authController')

const router= express.Router()

router.route('/create-hotel').post(authController.isLoggedin, formidable() ,hotelController.create)
router.route('/all-hotels').get(hotelController.hotels)
router.get("/image/:hotelId", hotelController.image)
router.route('/seller/hotels').get(authController.isLoggedin, hotelController.ownerHotels)
router.route('/:hotelId').get(hotelController.read)
router.route("/update-hotel/:hotelId").put(authController.isLoggedin,hotelController.hotelOwner,formidable(), hotelController.update)
router.route('/delete-hotel/:hotelId').delete(authController.isLoggedin,hotelController.hotelOwner, hotelController.remove)
router.route('/user/hotels').get(authController.isLoggedin, hotelController.userBookings)
router.route('/search/opp').post(hotelController.searchHotel)

module.exports= router


