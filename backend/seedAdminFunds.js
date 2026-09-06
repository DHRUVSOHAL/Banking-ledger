require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db.js');
const accountModel = require('./src/models/account.model.js');
const transectionModel = require('./src/models/transection.model.js');
const ledgerModel = require('./src/models/ledger.model.js');

async function seed() {
  await connectDB();

  const ADMIN_ACCOUNT_ID = "6a9d3daea35eba55477c9abd"; // 👈 copy button se liya hua ID
  const AMOUNT = 1000000; // ₹10,00,000 — jitna chahiye utna rakh lo

  const account = await accountModel.findById(ADMIN_ACCOUNT_ID);
  if (!account) {
    console.error("Account not found!");
    process.exit(1);
  }

  // Dummy "seed" transection banate hain — koi real fromAccount nahi hai, isliye toAccount aur fromAccount dono admin ka hi account rakhte hain (system-generated funds)
  const transection = await transectionModel.create({
    fromAccount: account._id,
    toAccount: account._id,
    amount: AMOUNT,
    idempotencyKey: `seed-admin-funds-${Date.now()}`,
    status: "Completed",
  });

  // Sirf ek CREDIT entry banayenge (system ke bahar se paisa aa raha hai, isliye koi DEBIT nahi)
  await ledgerModel.create({
    account: account._id,
    transection: transection._id,
    amount: AMOUNT,
    type: "CREDIT",
  });

  console.log(`✅ ₹${AMOUNT} credited to admin account ${ADMIN_ACCOUNT_ID}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});