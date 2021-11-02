require("dotenv").config();
require("./config/database").connect();

var express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// importing user context
var User = require("./model/user");
const auth = require("./middleware/auth");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register
app.post("/register", async (req, res) => {
	try {
		// Get user input
		var { first_name, last_name, email, password } = req.body;

		// Validate user input
		if (!(email && password && first_name && last_name)) {
			res.status(400).send("All input is required");
		}

		// Validate if user exist in our database
		var oldUser = await User.findOne({ email });

		if (oldUser) {
			return res.status(409).send("User Already Exist. Please Login");
		}

		//Encrypt user password
		encryptedPassword = await bcrypt.hash(password, 10);

		// Create user in our database
		var user = await User.create({
			first_name,
			last_name,
			email: email.toLowerCase(), // sanitize: convert email to lowercase
			password: encryptedPassword,
		});

		// Create token
		const token = jwt.sign({
			user_id: user._id, email
		},
			process.env.TOKEN_KEY,
			{ expiresIn: "2h", algorithm: "HS256" }
		);
		// save user token
		user.token = token;

		// return new user
		res.status(201).json(user);
	} catch (err) {
		console.log(err);
	}
});

// Login
app.post("/login", (req, res) => {
	try {
		// Get user input
		var { email, password } = req.body;

		// Validate user input
		if (!(email && password)) {
			res.status(400).send("All input is required");
		}
		// Validate if user exist in our database
		var user = (await User.findOne({ email }));

		if (user && (await bcrypt.compare(password, user.password))) {
			// Create token
			const token = jwt.sign(
				{ user_id: user._id, email },
				process.env.TOKEN_KEY,
				{
					expiresIn: "2h",
				}
			);

			// save user token
			user.token = token;
			res.status(200).json(user);
		}
		res.status(400).send("Invalid Credentials");
	} catch (err) {
		console.log(err);
	}
});

module.exports = login;