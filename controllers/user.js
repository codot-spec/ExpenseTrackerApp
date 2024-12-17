const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res ) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(403).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ name, email, password: hashedPassword });
    res.status(201).json(newUser);
  } catch (err) {
    console.error("Error in adding user:", err);
    res.status(500).json({ message: "Failed to add user" });
  }
};


exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists in the database
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // User not found
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the passwords
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (isPasswordCorrect) {
      // Password matches

      // Generate the JWT token inside this function
      const token = jwt.sign({ userId: user.id }, 'secretkey');  // <-- This line is the fix

      return res.status(200).json({
        message: 'User login successful',
        token: token // Send the token to the client
      });
    } else {
      // Incorrect password
      return res.status(401).json({ message: 'User not authorized' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
