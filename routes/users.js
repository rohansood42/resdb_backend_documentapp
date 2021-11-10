var express = require("express");
var router = express.Router();

var User = require("../model/user");

router.get("/all", async function (req, res) {
  try {
    const allUsers = await User.find();
    return res.status(200).json(allUsers);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/search", async function (req, res) {
  try {
    let searchValue = req.query.id ? req.query.id : req.query.email;
    let user = null;
    if (req.query.id) {
      user = await User.findById(searchValue);
    } else {
      user = await User.findOne({ email: searchValue });
    }

    return res.status(200).json(user);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
