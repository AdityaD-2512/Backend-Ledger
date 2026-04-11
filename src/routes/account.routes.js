const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controllers");


const router = express.Router();


//POST -> /api/accounts/
//create a new account & it is a Protected Route (means we require a valid token in cookies/headers)
router.post("/", authMiddleware.authMiddleware, accountController.createAccountController) //now we require the controller(account.controller) where we write a logic that how we create a account


//GET -> /api/accounts/
//get all accounts of the logged-in user
//protected route
router.get("/", authMiddleware.authMiddleware, accountController.getUserAccountController)



//GET -> /api/accounts/balance/:accountId
//fetching account balance of loggedIn account
router.get("/balance/:accountId", authMiddleware.authMiddleware, accountController.getAccountBalanceController)


module.exports = router;
