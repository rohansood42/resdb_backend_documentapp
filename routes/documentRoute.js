const express = require("express");
const multer = require("multer");
const path = require("path");
var router = express.Router();
const Document = require("../model/document");
const User = require("../model/user");

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

  let doc = await Document.create({
    name: name,
    associated_users: userRecords,
    document_hash: document_hash,
    document_location: req.file.path,
    transaction_history: [],
  });

  //MOCK API CALL TO BLOCKCHAIN

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

  const update = {
    name: name,
    associated_users: userRecords,
    document_hash: document_hash,
    document_location: req.file.path,
  };

  let doc = await Document.findOneAndUpdate(filter, update, {
    new: true,
  });

  //MOCK API CALL TO BLOCKCHAIN

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

  const filter = { _id: _id };
  const update = { name: name, associated_users: userRecords };

  let doc = await Document.findOneAndUpdate(filter, update, {
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
  const documents = await Document.findOne({
    associated_users: req.user.user_id,
  });

  return res.status(200).json(documents);
});

module.exports = router;
