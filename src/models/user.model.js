const mongoose = require("mongoose")
const bcryptjs = require("bcryptjs")    //for hashing

const userSchema = new mongoose.Schema({
    email : {
        type: String,
        required: [true, "Email is required for creating user"], //if not write email then msg will show
        trim: true,     //no spaces we want in b/w email
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid Email Address"],  //validate email format (for this email regex is used)
        unique: [true, "Email Already Exists."]
    },
    name:{
        type: String,
        required: [true, "Name is required for creating an account"],
    },
    password:{
        type: String,
        required: [true, "password is required for creating an account"],
        minlength: [6, "password should be more than 6 characters"],
        select: false   //password will not be occur by default in any query... while accessing user's info
    },
    systemUser: {   //to differentiate between system account(used for adding some funds to actual account at start) and acutal user account...
        type: Boolean,
        default: false,
        immutable: true,
        
        //sensitive info we do not read by default in query
        select: false   //means whenever we read it(via links/ req.body, etc imformation doesn't get by default... unless we have to ask seperately in code to get this) => by default system user there not shown
    }
}, {
    timestamps: true    //user when created and last time there data is updated we get info
})

userSchema.pre("save", async function(next){    //here we check if password is changed or not and if changed we have to store it again in hashed format
    if(!this.isModified("password")){   //if pass not modify
        return  //return next() we use if we don't use async func.
    }

    const hash = await bcryptjs.hash(this.password, 10);  //here we are using 10 rounds of salt
    this.password = hash    //pass converted to hash and again saved hashed pass in password

    return
})    //whenever we are saving user info this function will be called

userSchema.methods.comparePassword = async function(password){
    return await bcryptjs.compare(password, this.password)  //it compares the password in db and user entered pass. 
}

const model = mongoose.model("user", userSchema);

module.exports = model;