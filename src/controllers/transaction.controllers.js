const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.services");
const mongoose = require("mongoose");  //for creating session


/**
 *  -Create a new transaction
 *  THE 10- step transaction flow:
    * 1. Validate request
    * 2. Validate Idempotency key   //used so that 2 payment can't executed at same time...  [like if make payment to shop and money deducted from account -> transaction status pending (due to network issue) shop doesn't recieve money -> upi app send req to check if payment done or not and if not then req. another payment req for deduction of money -> so it check the idempotency key that any transaction is already exsist for same key or not if yes then payment req for amount deduction will not send]
    * 3. Check account status
    * 4. Derrive sender balance from ledger   //here we study concept of "Aggregation pipeline"  //check if available balance is sufficient to debit the requested money from that account or not
    * 5. Create Transaction (PENDING)     //from this part we finally start creating transaction   (created transaction we store in DB)
    * 6. Create debit ledger entry     //from 5-8 [4 main steps of transaction => they are completed in stack either all executed and save to DB or nothing saved to DB if any error occured in any one of the steps(among 4)]
    * 7. Create credit ledger entry    //so for this [5-8] we use startTransaction() provided by mongoDB
    * 8. Mark transaction completed
    * 9. commit mongodb session
    * 10. send email notification 
 */


async function createTransaction(req,res){


   //1. validate request   (this is the incomming data which we recieved from client so, here we validate/check that it is correct or not)
   
   const {fromAccount, toAccount, amount, idempotencyKey} = req.body;

   if(!fromAccount || !toAccount || !amount || !idempotencyKey){  //checking if they we are fetting it or not (and if among these one of the following is not there then we return error)
      return res.status(400).json({  //400 send when there is an error from client side(because these things are given by user) and server can't process it
         message: "fromAccount, toAccount, amount and idempotency Key is required"
      })
   }

   //now after getting above details we have to check if the account details which is given by user exsists or not   (for this we require accountModel)
   const fromUserAccount = await accountModel.findOne({
      _id: fromAccount,
   })

   const toUserAccount = await accountModel.findOne({
      _id: toAccount,
   })

   if(!fromUserAccount || !toUserAccount){
      return res.status(400).json({
         message: "Invalid fromAccount or toAccount"
      })
   }



   //2. Validate Idempotency key

   //check if for that perticular idempotency key any transaciton already exists or not...
   const isTransactionAlreadyExsits = await transactionModel.findOne({
      idempotencyKey: idempotencyKey
   })

   if(isTransactionAlreadyExsits){  //if key is same then
      if(isTransactionAlreadyExsits.status === "COMPLETED"){ //if while req. send and key already exsists for transaction in between if transaction completed so we send details of transaction or msg it
         return res.status(200).json({
            message: "Transaction already processed",
            transaction: isTransactionAlreadyExsits
         })
      }

      if(isTransactionAlreadyExsits.status === "PENDING"){  //if pending so we just send msg that transaction is pending
         return res.status(200).json({
            message: "Transaction already processed"
         })
      }

      if(isTransactionAlreadyExsits.status === "FAILED"){
         return res.status(500).json({
            message: "Transaction processeing failed previously, please retry",
         })
      }

      if(isTransactionAlreadyExsits.status === "REVERSED"){
         return res.status(500).json({
            message: "Transaction processeing reversed, please retry",
         })
      }
   }



   //3. check account status  (if account given by the user is exsist but its status is closed or frozen so we can't use it, for transaction bith account status should be in active condition)

   if(!fromUserAccount.status === "ACTIVE" || !toUserAccount.status === "ACTIVE"){
      return res.status(400).json({
         mesaage: "Both fromAccount and toAccount must be ACTIVE to process transaction"
      })
   }



   //4. Derive sender balance from ledger (aggregate method is created in account model to find the balance of the fromAccount)
   const balance = await fromUserAccount.getBalance();

   if(balance < amount){
      return res.status(400).json({
         message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
      })
   }

   let transaction;

   try{  //under try & catch block to manage error (like if we make 2 same transaction while one is still processing)
   
   //5. create transaction (PENDING)   -> 5 to 9 step in this done...

   const session = await mongoose.startSession();
   session.startTransaction();   //start transaction function is provided by mongoDB that after this function either all function/work is executed and save to DB or nothing if any error occured in anyone of them

   transaction = (await transactionModel.create([{   //we don't save transaction directly in DB we first create it locally (earlier await transactionModel.create)
      fromAccount,
      toAccount,
      amount,
      idempotencyKey,
      status : "PENDING"
   }], {session}))[0] //(for array 0)  //session is passed as 2nd parameter so that mongoDB understands which function should be executed in stack (either all execute or nothing)

   
   const debitLedgerEntry = await ledgerModel.create([{
      account: fromAccount,
      amount: amount,
      transaction: transaction._id,
      type: "DEBIT"
   }], {session})


   await (() => { //so that there is a gap of some time between debitLedgerEcntry and credit entry (because sometimes it may take some time to complete the transaction) and if in between we make other payment it denied due to same idempotency key... (only to make it realistic banks take some time to process)
      return new Promise((resolve) => setTimeout(resolve, 15*1000));
   })()


   const creditLedgerEntry = await ledgerModel.create([{
      account: toAccount,
      amount: amount,
      transaction: transaction._id,
      type: "CREDIT"
   }], {session})


   // transaction.status = "COMPLETED"; //after all 5-7 part is done so now 8th part we will set status to completed
   // await transaction.save({session});


   //above part we have commented down because at start we have set transaction.status as "pending" and if transaction actually not completed but to complete the transaction at last it set the status completed because it is in the session(either execute all or nothing)
   await transactionModel.findOneAndUpdate(  //replace our above save with findOneAndUpdate
      {_id: transaction._id},
      {status: "COMPLETED"},
      {session}
   )


   await session.commitTransaction();  //saving transaction in DB till step 5-8 in our step 9 => commit mongoDB session
   session.endSession();   //at last we will end the created session

   }catch(err){
      return res.status(400).json({
         message : "Transaction is pending due to some issue, please retry after sometime"
      })
   }


   //10. send email notification (we already created a function to send the transaction email in email.service.js)
   await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount);

   return res.status(201).json({
      mesaage: "Transaction completed successfully",
      transaction: transaction
   })
}



//for system initial funds transaction...
async function createInitialFundsTransaction(req, res){
   const {toAccount, amount, idempotencyKey} = req.body;

   if(!toAccount || !amount || !idempotencyKey){ 
      return res.status(400).json({
         message: "fromAccount, toAccount, amount and idempotency Key is required"
      })
   }

   //now after getting above details we have to check if the account details which is given by user exsists or not   (for this we require accountModel)
   const toUserAccount = await accountModel.findOne({
      _id: toAccount,
   })

   if(!toUserAccount){
      return res.status(400).json({
         message: "Invalid toAccount"
      })
   }


   //now for a ledger entry we need two account (from and to account) hence we have to find and check our fromAccount which is our system account
   const fromUserAccount = await accountModel.findOne({
      // systemUser: true,
      user: req.user._id
   })

   if(!fromUserAccount){
      return res.status(400).json({
         message: "system user not found"
      })
   }

   
   //now here we get both from and to account now we have to create transaction for that first we create session
   const session = await mongoose.startSession();
   session.startTransaction();


   //we do not create transaction directly to DB firstly we create a client side transaction(not save in DB currently only will be created in server)
   const transaction = new transactionModel({   //else await transactionModel and session will be present
      fromAccount: fromUserAccount._id,
      toAccount,
      amount,
      idempotencyKey,
      status : "PENDING"
   })

   
   //whenever we use session our data go in form of object array...
   const debitLedgerEntry = await ledgerModel.create([{  //data will send in array of object format
      account: fromUserAccount._id,
      amount: amount,
      transaction: transaction._id,
      type: "DEBIT"
   }], {session})


   const creditLedgerEntry = await ledgerModel.create([{
      account: toAccount,
      amount: amount,
      transaction: transaction._id,
      type: "CREDIT"
   }], {session})


   transaction.status = "COMPLETED"; //after all 5-7 part is done so now 8th part we will set status to completed
   await transaction.save({session});

   await session.commitTransaction();
   session.endSession();

   return res.status(201).json({
      message: "Initial funds transaction completed successfully",
      transaction: transaction
   })
}



module.exports = {
   createTransaction,
   createInitialFundsTransaction
}
