const accountModel = require('../models/account.model.js')



async function createAccount(req, res) {

    const user = req.user

    const account = await accountModel.create({
        user: user._id
    })
    res.status(201).json({
        message: "account created successfully",
        status: "success",
        account
    })

}

async function getAUserAccountsOfUser(req, res) {
    const accounts=await accountModel.find({user:req.user._id})
    res.status(200).json({
        message:"accounts fetched successfully",
        status:"success",
        accounts
    })
}







module.exports = {
    createAccount,
    getAUserAccountsOfUser


}