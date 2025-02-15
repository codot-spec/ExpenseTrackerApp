const User = require('../models/users');
const Expenses = require('../models/expenses');
const Orders = require('../models/orders');
const ContentLoaded = require('../models/contentloaded');
const ForgotPassword = require('../models/forgotpassword');
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
  return jwt.sign({ userId: id, name: name, isPremium }, process.env.TOKEN_SECRET);
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



// Edit User functionality
exports.editUser = async (req, res) => {
  try {
    const userId = req.params.userId;  // The userId should be passed in the URL
    const { name, email, password } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow modification if the user is updating their own details or is an admin
    // Here, assuming the logged-in user's ID is stored in the JWT token
    if (req.user.id !== user.id) {
      return res.status(403).json({ message: 'You can only edit your own profile' });
    }

    // Validate the new data
    if (name) user.name = name;
    if (email) user.email = email;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete User functionality
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;  // The userId should be passed in the URL

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow deletion if the user is deleting their own account or is an admin
    // Here, assuming the logged-in user's ID is stored in the JWT token
    if (req.user.id !== user.id) {
      return res.status(403).json({ message: 'You can only delete your own profile' });
    }
  
    await Expenses.destroy({ where: { userId: userId } });
    await Orders.destroy({ where: { userId: userId } });
    await ContentLoaded.destroy({ where: { userId: userId } });
    await ForgotPassword.destroy({ where: { userId: userId } });

    await user.destroy();

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.fetchUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;  // Get user ID from the URL parameter

    const user = await User.findByPk(userId);  // Adjust based on your ORM or database query method

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send back user profile data (exclude sensitive info like password)
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password
    };

    res.status(200).json(userProfile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};