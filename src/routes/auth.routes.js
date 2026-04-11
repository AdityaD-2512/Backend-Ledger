const express = require("express")
const authController = require("../controllers/auth.controllers")

const router = express.Router();

//api-> this can be read as -> "api/auth/register" as pass it in app.use() in app.js
router.post("/register", authController.userRegisterController)

//POST:- /api/auth/login
router.post("/login", authController.userLoginController)

//POST:- /api/auth/logout
router.post("/logout", authController.userLogoutController)


module.exports = router //require it in app.js