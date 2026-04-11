const accountModel = require("../models/account.model");


async function createAccountController(req, res){

    const user = req.user;

    //creating account with user's id...
    const account = await accountModel.create({
        user: user.id
    })

    res.status(201).json({
        account     //sending account data as response
    })

}

async function getUserAccountController(req, res){
    const accounts = await accountModel.find({user: req.user._id});  //find all account

    res.status(200).json({
        accounts    //send all acc. in res
    })
}


async function getAccountBalanceController(req, res){
    const {accountId} = req.params;

    //now we have to check if what accountId we are getting (from params) same we are requesting or not
    const account = await accountModel.findOne({
        _id : accountId,
        user: req.user._id  //user's account is or not
    })

    if(!account){   //either id is wrong or not the users account(because we can't see the balance of other person)
        return res.status(404).json({
            message: "Account not found"
        })
    }

    //if account found we have already created getBalance() method in accountModel
    const balance = await account.getBalance();

    res.status(200).json({
        accountId: account._id,
        balance: balance
    })
}


module.exports = {
    createAccountController,
    getUserAccountController,
    getAccountBalanceController
}