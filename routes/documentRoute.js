const express = require("express");
const multer = require("multer");
const path = require("path");
var router = express.Router();
const Document = require("../model/document");
const User = require("../model/user");
const Transaction = require("../model/transaction");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },

  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single("file"), async function (req, res) {
  let { name, associated_users, document_hash } = req.body;

  if (!(name && associated_users && document_hash)) {
    return res.status(400).json({ message: "All input is required" });
  }

  const userRecords = await User.find({
    _id: { $in: JSON.parse(associated_users) },
  });

  let nTransaction = await Transaction.create({
    status: "Pending",
    action: "Add a new File",
    performed_by: req.user.user_id,
  });

  let doc = await Document.create({
    name: name,
    associated_users: userRecords,
    document_hash: document_hash,
    document_location: req.file.path,
    transaction_history: [nTransaction],
    status: userRecords.length === 1 ? "Confirmed" : "Pending",
    approved_by: userRecords.length === 1 ? [] : [req.user.user_id],
  });

  let cTransaction = await Transaction.create({
    status: "Committed",
    action: "Committed to Blockchain",
    performed_by: req.user.user_id,
  });

  doc.transaction_history.push(cTransaction);

  const filter = { _id: doc._id };
  const update = {
    transaction_history: doc.transaction_history,
  };

  doc = await Document.findOneAndUpdate(filter, update, {
    new: true,
  });

  return res.status(201).json({
    message: "File Uploaded Successfully and Submitted to the Blockchain",
    data: doc,
  });
});

// Modify the file itself
router.patch("/upload", upload.single("file"), async function (req, res) {
  let { _id, name, associated_users, document_hash } = req.body;

  if (!(name && associated_users && document_hash && _id)) {
    return res.status(400).json({ message: "All input is required" });
  }

  const userRecords = await User.find({
    _id: { $in: JSON.parse(associated_users) },
  });

  const filter = { _id: _id };

  let nTransaction = await Transaction.create({
    status: "Confirmed",
    action: "Modify a file",
    performed_by: req.user.user_id,
  });

  let doc = await Document.findById(_id);

  doc.transaction_history.push(nTransaction);

  const update = {
    name: name,
    associated_users: userRecords,
    document_hash: document_hash,
    document_location: req.file.path,
    transaction_history: doc.transaction_history,
    status: userRecords.length === 1 ? "Confirmed" : "Pending",
    approved_by: userRecords.length === 1 ? [] : [req.user.user_id],
  };

  doc = await Document.findOneAndUpdate(filter, update, {
    new: true,
  });

  return res.status(201).json({
    message: "File Uploaded Successfully and Submitted to the Blockchain",
    data: doc,
  });
});

//Edit the data of the document
router.put("/data", async function (req, res) {
  let { _id, name, associated_users } = req.body;

  if (!(name && associated_users && _id)) {
    return res.status(400).json({ message: "All input is required" });
  }

  const userRecords = await User.find({
    _id: { $in: JSON.parse(associated_users) },
  });

  let doc = await Document.findById(_id);

  let nTransaction = await Transaction.create({
    status: "Confirmed",
    action: "Edit metadata for the file",
    performed_by: req.user.user_id,
  });

  doc.transaction_history.push(nTransaction);

  const filter = { _id: _id };
  const update = {
    name: name,
    associated_users: userRecords,
    transaction_history: doc.transaction_history,
    status: userRecords.length === 1 ? "Confirmed" : "Pending",
    approved_by: userRecords.length === 1 ? [] : [req.user.user_id],
  };

  doc = await Document.findOneAndUpdate(filter, update, {
    new: true,
  });

  return res.status(200).json(doc);
});

router.get("/download", async function (req, res) {
  let fileId = req.query.id;

  let file = await Document.findById(fileId);
  res.download(file.document_location);
});

router.get("/user", async function (req, res) {
  let key = req.query.type;
  const documents = await Document.find({
    status: key,
    associated_users: req.user.user_id,
  })
    .populate("associated_users transaction_history approved_by")
    .populate({
      path: "transaction_history",
      populate: { path: "performed_by" },
    });

  return res.status(200).json(documents);
});

router.post("/verify", async function (req, res) {
  let { _id, document_hash } = req.body;

  let file = await Document.findById(_id);

  let verified = file.document_hash === document_hash;

  return res.status(200).json({ isVerified: verified });
});

router.post("/approve", async function (req, res) {
  let { _id } = req.body;

  let file = await Document.findById(_id);

  file.approved_by.push(req.user.user_id);

  let nTransaction = await Transaction.create({
    status: "Confirmed",
    action: "Approve by user " + req.user.user_id,
    performed_by: req.user.user_id,
  });

  file.transaction_history.push(nTransaction);

  const filter = { _id: _id };
  const update = {
    status:
      file.approved_by.length === file.associated_users.length
        ? "Confirmed"
        : "Pending",
    approved_by:
      file.approved_by.length === file.associated_users.length
        ? []
        : file.approved_by,
    transaction_history: file.transaction_history,
  };

  let doc = await Document.findOneAndUpdate(filter, update, {
    new: true,
  });

  return res.status(200).json({ document: doc });
});

module.exports = router;
