const mongoose = require("mongoose")
const transactionModel = require("./transaction.model")


const ledgerSchema = new mongoose.Schema({  //on ledger all fields should be immutable
    account: {  //in ledger many transaction is created for 1 single account. so, we have to apply some efficient queries [like for cheking balance we have to see all credited tranaction till yet and all debited transaction abd subtract it to get current balance]
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Ledger must be associated with account"],
        index: true,
        immutable: true    //because ledger is a only source of truth for the transaction so if created can't be changed
    },
    amount: {
        type: Number,
        required: [true, "Amount is required for creating a ledger entry"],
        immutable: true
    },
    transaction: {  //for which transaction this ledger entry is... 
        type: mongoose.Schema.Types.ObjectId,
        ref: "transaction",
        required: [true, "Ledger must be associated with a transaction"],
        index: true,
        immutable: true
    },
    type: {
        type: String,
        enum: {
            values: ["CREDIT", "DEBIT"],
            message: "Type can either be CREDIT or DEBIT",
        },
        required: [true, "Ledger type is required"],
        immutable: true,
    }
    
})


//our LEDGER can't be modified in future so we use some "hooks" to prevent modification of any transaction history in future

function preventLedgerModification(){   //if someone tries to modify our ledger immediately error thorwn with msg
    throw new Error("Ledger entries are immutable and cannot be modified or deleted");
}


ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('findOneAndReplace', preventLedgerModification);
ledgerSchema.pre('findOneAndRemove', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);


const ledgerModel = mongoose.model('ledger', ledgerSchema);

module.exports = ledgerModel;
