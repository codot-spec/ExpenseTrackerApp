const User = require('../models/user');
const bcrypt = require('bcryptjs');

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
            return res.status(200).json({ message: 'User login successful' });
        } else {
            // Incorrect password
            return res.status(401).json({ message: 'User not authorized' });
        }
  } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
  }
};

// function isstringinvalid(string){
//   if(string == undefined ||string.length === 0){
//       return true
//   } else {
//       return false
//   }
// }

// const signup = async (req, res)=>{
//   try{
//   const { name, email, password } = req.body;
//   console.log('email', email)
//   if(isstringinvalid(name) || isstringinvalid(email || isstringinvalid(password))){
//       return res.status(400).json({err: "Bad parameters . Something is missing"})
//   }
//   const saltrounds = 10;
//   bcrypt.hash(password, saltrounds, async (err, hash) => {
//       console.log(err)
//       await User.create({ name, email, password: hash })
//       res.status(201).json({message: 'Successfuly create new user'})
//   })
//   }catch(err) {
//           res.status(500).json(err);
//       }

// }


// const login = async (req, res) => {
//   try{
//   const { email, password } = req.body;
//   if(isstringinvalid(email) || isstringinvalid(password)){
//       return res.status(400).json({message: 'EMail idor password is missing ', success: false})
//   }
//   console.log(password);
//   const user  = await User.findAll({ where : { email }})
//       if(user.length > 0){
//          bcrypt.compare(password, user[0].password, (err, result) => {
//          if(err){
//           throw new Error('Something went wrong')
//          }
//           if(result === true){
//               return res.status(200).json({success: true, message: "User logged in successfully"})
//           }
//           else{
//           return res.status(400).json({success: false, message: 'Password is incorrect'})
//          }
//       })
//       } else {
//           return res.status(404).json({success: false, message: 'User Doesnot exitst'})
//       }
//   }catch(err){
//       res.status(500).json({message: err, success: false})
//   }
// }

// module.exports = {
//   signup,
//   login

// }