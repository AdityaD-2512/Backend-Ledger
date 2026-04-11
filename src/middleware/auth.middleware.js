const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const tokenBlackListModel = require("../models/blackList.model")



//it's work is to check the token in cookies and if found -> then verify it & if verified ,valid user logged in else not
async function authMiddleware(req, res, next){  //check if token is in cookies or headers(inside authorization part) or not

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    //if we don't found token there means user doesn't logged in
    if(!token){
        return res.status(401).json({
            message: "Unauthorized access, token is missing"
        })
    }

    //if found then first is it blackListed or not
    const isBlackListed = await tokenBlackListModel.findOne({token})

    if(isBlackListed){
        return res.status(401).json({
            message : "Unauthorized access, token in invalid"
        })
    }


    //if token found we verify it
    try{

        const decoded = jwt.verify(token, process.env.JWT_SECRET);  //from out jwt we verify our token & if verified;  decoded will now have the data which we have given while created the token (while registration of user in auth.controller) which is "user.id"
        
        //finding user on behalf of his id & save its data in user variable
        const user = await userModel.findById(decoded.userId)   //.select("-password"); we have not written after it because we have select: false while creating user model, hence password of user not come by default so no need to remove it

        req.user = user;
        return next();

    }catch(err){    //if not verified err occur
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }
}



//for system user auth
async function authSystemUserMiddleware(req, res, next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    //if we don't found token there means user doesn't logged in
    if(!token){
        return res.status(401).json({
            message: "Unauthorized access, token is missing"
        })
    }

    const isBlackListed = await tokenBlackListModel.findOne({token})

    if(isBlackListed){
        return res.status(401).json({
            message : "Unauthorized access, token in invalid"
        })
    }


    //if token found we verify it
    try{

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        //finding user on behalf of his id & save its data in user variable
        const user = await userModel.findById(decoded.userId).select("+systemUser") //because initially we select: false in this(account model -> systemUser) so to access it we would have now select it first

        if(!user.systemUser){
            return res.status(403).json({   //403 -> forbidden
                message: "Forbidden access, not a system user"
            })
        }


        //if it is a system user then
        req.user = user;
        return next();

    }catch(err){    //if not verified err occur
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }

}


module.exports = {
    authMiddleware,
    authSystemUserMiddleware
}