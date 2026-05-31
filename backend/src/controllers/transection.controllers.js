const transectionModel=require('../models/transection.model.js')


const ledgerModel=require('../models/ledger.model.js')



/**
 * create a new transection
 * The 10 steps TRANSFER flow:
 * 1.validate request
 * 2.validate idempotencykey
 * 3.check account status
 * 4.Derive sender balance fro ledger
 * 5.create transection(pending)
 * 6.create debit ledger entry
 * 7.create credit ledger entry
 * 8.mark transection complete
 * 9.commit mongodb sessions
 * 10.send email notifcation
 */