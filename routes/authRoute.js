const authController= require('./../controller/authController')

const express = require('express')

const router= express.Router()

router.route('/login').post(authController.login)
router.route('/register').post(authController.register)

module.exports=router


