const User = require('../models/user');

exports.addUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
  
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(403).json({ message: "User with this email already exists" });
    }
    const newUser = await User.create({ name, email, password });
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add user" });
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve users" });
  }
};

exports.deleteUser = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

exports.updateUser = async (req, res, next) => {
  const userId = req.params.userId;
  const { name, email, password } = req.body;

  try {
    const [updatedCount] = await User.update(
      { name, email, password },
      { where: { id: userId } }
    );
    if (updatedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const updatedUser = await User.findByPk(userId);
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user" });
  }
};

exports.signin = async (req, res, next) => {
  try {
      const { email, password } = req.body;

      // Check if the user exists in the database
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
          // User not found
          return res.status(404).json({ message: 'User not found' });
      }

      // Compare the passwords (plaintext comparison)
      if (user.password === password) {
          // Password matches
          return res.status(200).json({ message: 'User login successful' });
      } else {
          // Password doesn't match
          return res.status(401).json({ message: 'User not authorized' });
      }
  } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
  }
};