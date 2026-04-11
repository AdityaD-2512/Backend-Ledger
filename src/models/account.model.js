const mongoose = require("mongoose");
const ledgerModel = require("../models/ledger.model");  //for creating method for transaction controller to check balance

const accountSchema = new mongoose.Schema({
    user: { //details of user
        type: mongoose.Schema.Types.ObjectId, 
        ref: "user",    //reference is gone to our user (collection) which we have created(user model)
        required: [true, "Account must be associated to a user"],
        index: true     //based on the user's id it creates an index (because there are multiple accounts (also 1 user having multiple account) so fetching/searching will be fast and easy based on the user's id)
        //this index searching is worked via a DSA called B+ tree(if our DB having 10 lakh entry so it will at end just see 50 and give output (optimized way and time saving))
    },
    status: {
        type: String,
        enum: {
            values: ["ACTIVE", "FROZEN", "CLOSED"], //active-> user currently using this acc for transaction;  frozen-> account active but currently can't use it;   closed-> user closed this acc
            message: "status can be either ACTIVE, FROZEN, or CLOSED"
        }, 
        default: "ACTIVE"
    },
    currency: {
        type: String,   //because multiple currency are there
        required: [true, "Currency is required for creating an account"],
        default: "INR"
    },
    // for balance we don't directly store user's balance in DB so for this we use LEDGER... (we can store balance in cache also)
},{
    timestamps : true   //user's acc when created
})


//we created index in 2 fields so it is called as compund index
accountSchema.index({user:1, status: 1});   //here we have created coumpound index in accountSchema (we can find account on the basis of user and status of acc)




//creating method for transaction controller which will check the balance of senders account from which money is going to be debit

accountSchema.methods.getBalance = async function(){  //method name is "getBalance"

    const balanceData = await ledgerModel.aggregate([   // .aggregate => feature of mongodb which helps us to run our custom query
        
        { $match: {account: this._id}},  // take/find out all ledger entries(all type of debit, credit) which matches with this query (which is id)
        
        //now after getting all the entries from ledger whose type is credit we add all and whose type is debit we add all => credit-debit to get current balance

        {
            $group: {   //group total debit and credit
                _id: null,
                totalDebit: {   //from here we get total debit sum
                    $sum:{  //sum function
                        $cond: [    //condition function of aggregate function
                            {$eq: ["$type", "DEBIT"]},   //equal function (whose type is debit)
                            "$amount",   //that amount we needed and sum it all
                            0   //if type not debit then add 0
                        ]
                    }
                },
                totalCredit: { 
                    $sum:{  
                        $cond: [    
                            {$eq: ["$type", "CREDIT"]},   
                            "$amount",
                            0 
                        ]
                    }
                }
            }
        },

        {   //at last we project balance
            $project: {
                _id: 0,
                balance: {$subtract: ["$totalCredit", "$totalDebit"]}   //subtract them
            }
        }

    ])  //we call this method directly to our transaction controller to find out balance for userAccount

    //this function returns array so, if user account is fresh means no ledger entry it return empty array to prevent this...
    if(balanceData.length === 0){
        return 0;
    }

    return balanceData[0].balance;  //(as it return balance in array)
}




//creating account model
const accountModel = mongoose.model("account", accountSchema);    //collection name is "account"
module.exports = accountModel;