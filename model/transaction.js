const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  status: { type: String },
  hash: { type: String },
  action: { type: String },
  performed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Transaction", transactionSchema);
