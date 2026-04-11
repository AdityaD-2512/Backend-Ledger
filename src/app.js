const express = require("express"); //now a days import is there but we used require because old companies have require in there codebase
const cookieParser = require("cookie-parser");


const app = express();  //created instance of server and store in app

app.use(express.json()) //this is used because express server by default can't read data inside req.body hence we use this
app.use(cookieParser());


//Routes Required
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes");

//use Routes
app.use("/api/auth", authRouter)    //from this url/(end points) whose starting with "/api/auth" those request will be gone authRouter
app.use("/api/accounts", accountRouter)
app.use("/api/transactions", transactionRoutes)

module.exports = app;