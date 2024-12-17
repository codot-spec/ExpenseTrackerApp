const User = require('../models/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userController=require('./user');

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

// Generate JWT token (with isPremium field included)
exports.generateAccessToken = (id, name, isPremium) => {
  return jwt.sign({ userId: id, name: name, isPremium: isPremium }, 'secretkey');
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
      const token = userController.generateAccessToken(user.id, user.name, user.isPremium);  // <-- This line is the fix

      return res.status(200).json({
        message: 'User login successful',
        token: token , // Send the token to the client
        isPremium: user.isPremium // Return the user's premium status
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


// exports.getUserStatus = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await User.findByPk(userId);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.status(200).json({
//       isPremium: user.isPremium
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


