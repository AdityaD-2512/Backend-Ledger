const {Router} = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const transactionController = require("../controllers/transaction.controllers");

const transactionRoutes = Router();


//POST -> /api/transactions/
//create a new transaction

transactionRoutes.post("/", authMiddleware.authMiddleware, transactionController.createTransaction); //authMiddleware we again used in this transaction to check if the user which is sending money is logged in or not(means from his account the money is deducting not from others account)


//POST -> /api/transactions/system/inital-funds
//create initial funds transaction from system user

transactionRoutes.post("/system/initial-funds", authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction);


module.exports = transactionRoutes;