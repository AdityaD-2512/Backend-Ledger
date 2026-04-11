require("dotenv").config()   //so that we use our key which is in dotenv

const app = require("./src/app")

const connectToDB = require("./src/config/db")

connectToDB()   //call this from db.js to connect our db from server(express)


app.listen(3000, ()=>{      //for start our server
    console.log("server is running on port 3000");
})