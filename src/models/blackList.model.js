const mongoose = require("mongoose")

const tokenBlackListSchema = new mongoose.Schema({
    token:{
        type: String,
        required : [true, "Token is required to blackList"],
        unique: [true, "Token is already listed"]
    }
}, {
    timestamps: true
})


//at certain amount of time the token will be blacklisted or removed from the DB    (this is called as TTL when at certain time the token will expire)
tokenBlackListSchema.index({createdAt: 1}, {
    expireAfterSeconds : 60*60*23*3 //3days
})

const tokenBlackListModel = mongoose.model("tokenBlackList", tokenBlackListSchema);

module.exports = tokenBlackListModel;