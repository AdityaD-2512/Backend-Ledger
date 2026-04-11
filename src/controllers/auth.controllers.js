const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.services");
const tokenBlackListModel = require("../models/blackList.model");

//now we will create our controller function


//user register controller used on route POST /api/auth/register
async function userRegisterController(req, res){  //inside this controller some data entered and we have to create new user with that data (like email, pass and name)

    const {email, password, name} = req.body;

    const isExists =await userModel.findOne({    //checking if email entered already exist or not
        email: email
    })

    if(isExists){
        return res.status(422).json({   //if email exist we send response to user...
            message: "user already exists with email.",
            status: "failed"
        })
    }


    //if email not already exsit we create user
    const user = await userModel.create({
        email, password, name
    })

    //hence for being logged in we require token (jwt token)
    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "3d"});   //it will ask us payload and a private key and also expiry...
    //now we have to set our token in cookies...(so we use cookie-parser)
    res.cookie("token", token);  //here inside cookie we have saved our token

    res.status(201).json({   //whenever we create a new resource in api via user req so response send is 201 acc. to rest api 
        user:{
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token   //we already saved our token in cookie so it's not necessary...
    }) 


    //after user registration done and status send to user we will now send welcome email to user via nodemailer in (services folder we have code for it)
    await emailService.sendRegistrationEmail(user.email, user.name);    //function created in email services
}


//user login controller :- POST /api/auth/login
async function userLoginController(req, res){
    const {email, password} = req.body;

    //now based on email we find user

    const user = await userModel.findOne({email}).select("+password")   //we have to select password also because at starting of the userModel we have put (select to false) means automatic password will not be passed until we define it..(due to our security feature :) )

    if(!user){  //if user not found
        return res.status(401).json({
            message: "Email or password is INVALID"
        })
    }

    const isValidPassword = await user.comparePassword(password)

    if(!isValidPassword){
        return res.status(401).json({
            message: "Email or password is INVALID"
        })
    }

    //if pass matches then again we generate token
    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "3d"});   //it will ask us payload and a private key and also expiry...
    //now we have to set our token in cookies...(so we use cookie-parser)
    res.cookie("token", token);  //here inside cookie we have saved our token

    //status code 200 because we have logged in, (201 when creating new user)
    res.status(200).json({   //whenever we create a new resource in api via user req so response send is 201 acc. to rest api 
        user:{
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token   //we already saved our token in cookie so it's not necessary...
    }) 
}


//user logout controller
//POST-> /api/auth/logout
async function userLogoutController(req, res) {
    //we first have to takeout the token which we have to blacklist (which is either in cookies or headers)
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(200).json({   //we can also send 400/200 in res because we already logged out that's why we don't have token to logout again
            message : "User logged out successfully"
        })
    }

    // res.cookie("token", "")

    //now after clearing token from cookie we will now blackList it so that if anyone has the copy of it, they can't misuse it
    await tokenBlackListModel.create({
        token: token
    })

    res.clearCookie("token")

    res.status(200).json({
        message: "User logged out successfully"
    })
}

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}