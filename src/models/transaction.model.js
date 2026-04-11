const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({ //for 1 transaction there has to be involved 2 accounts
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account", //refernce of the account taken which we have created in account model
        required: [true, "Transaction must be associated with a from account"],
        index: true     //index is given so that in case we have to take out all transaction for the perticular account will be fast
    },

    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Transaction must be associated with a to account"],
        index: true
    },

    status: {
        type: String,
        enum: {
            values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            message: "Status must be either PENDING, COMPLETED, FAILED or REVERSED",
        },
        default: "PENDING"
    },

    amount: {
        type: Number,
        required: [true, "Amount is required for creating a transaction"],
        min: [0, "Transaction amount annot be negative"],
    },

        //for a single transaction only 1 unique idempotency key is generated
    idempotencyKey: {  //for tracking each transaction  (and stops the amount dedection 2 times in case of network issue/errors), it generates on client side only backend doesn't generate it
        type: String,
        required: [true, "Idempotency key is required for creating a transaction"],
        index: true,
        unique: true
    }
}, {
    timestamps: true
})

const transactionModel = mongoose.model("transaction", transactionSchema);

module.exports = transactionModel;