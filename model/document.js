const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  name: { type: String },
  associated_users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  document_hash: { type: String },
  document_location: { type: String },
  transaction_history: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
  ],
});

module.exports = mongoose.model("Document", documentSchema);
