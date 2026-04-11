const mongoose = require("mongoose")

async function connectToDB(){ //before we use our key here we have to require & config dotenv in server.js
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("server is connected to DB");
    })
    .catch(err => {
        console.log("error connecting to DB");
        process.exit(1);    //stops server because without connecting to db it just take resources so better to shut it down
    })
}

module.exports = connectToDB