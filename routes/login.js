var express = require("express");
var router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// importing user context
var User = require("../model/user");

// Register
router.post("/register", async (req, res) => {
  try {
    // Get user input
    var { first_name, last_name, email, password } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name)) {
      return res.status(400).json({ message: "All input is required" });
    }

    // Validate if user exist in our database
    var oldUser = await User.findOne({ email });

    if (oldUser) {
      return res
        .status(409)
        .json({ message: "User Already Exist. Please Login" });
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    var user = await User.create({
      first_name,
      last_name,
      email: email,
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      {
        user_id: user._id,
        email,
      },
      process.env.TOKEN_KEY
    );
    // save user token
    user.token = token;

    // return new user
    return res.status(201).json(returnUser);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    // Get user input
    var { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      return res.status(400).json({ message: "All input is required" });
    }
    // Validate if user exist in our database
    var user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY
      );

      // save user token
      user.token = token;
      return res.status(200).json(user);
    }
    return res.status(400).json({ message: "Invalid Credentials" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
