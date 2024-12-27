const uuid = require('uuid');

const bcrypt = require('bcryptjs');
const path = require('path');

const User = require('../models/users');
const Forgotpassword = require('../models/forgotpassword');

const resend1 = require('resend');
const resend = new resend1.Resend(process.env.RESEND_API_KEY);

const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (user) {
      const id = uuid.v4();
      await user.createForgotpassword({ id, active: true });

      const resetLink = `http://localhost:3000/password/resetpassword/${id}`;

      await sendPasswordResetEmail(email, resetLink);

      return res.status(200).json({
        message: 'Link to reset password sent to your mail ',
        success: true,
      });

    } else {
      throw new Error('User doesnt exist');
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err, success: false }); 
  }
};

const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    const response = await resend.emails.send({
      to: email,
      from: 'exform.arc@gmail.com',
      subject: 'Password Reset for Your Account',
      html: `<a href="${resetLink}">Reset your password</a>`,
    });

    console.log('Password reset email sent:', response.statusCode);

  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error; 
  }
};


// const resetpassword = (req, res) => {
//    const id =  req.params.id;
//    Forgotpassword.findOne({ where : { id }}).then(forgotpasswordrequest => {
//      if(forgotpasswordrequest){
//        forgotpasswordrequest.update({ active: false});
//        res.sendFile(path.join(__dirname, '..', 'views', 'resetpassword.html'), (err, data) => {
//         if (err) {
//           console.error('Error sending file', err);
//           return res.status(500).json({ message: 'Error sending file', success: false });
//         }
//       });
//        }
//    })
// }

// const resetpassword = (req, res) => {
//   const id =  req.params.id;
//   Forgotpassword.findOne({ where : { id }}).then(forgotpasswordrequest => {
//       if(forgotpasswordrequest){
//           forgotpasswordrequest.update({ active: false});
//           res.status(200).send(`<html>
//                                   <script>
//                                       function formsubmitted(e){
//                                           e.preventDefault();
//                                           console.log('called')
//                                       }
//                                   </script>

//                                   <form action="/password/updatepassword/${id}" method="get">
//                                       <label for="newpassword">Enter New password</label>
//                                       <input name="newpassword" type="password" required></input>
//                                       <button>reset password</button>
//                                   </form>
//                               </html>`
//                               )
//           res.end()

//       }
//   })
// }

const resetpassword = (req, res) => {
  const id = req.params.id;
  Forgotpassword.findOne({ where: { id } }).then(forgotpasswordrequest => {
    if (forgotpasswordrequest) {
      forgotpasswordrequest.update({ active: false });
      res.status(200).send(`
        <html>
          <head>
            <style>
              body {
                font-family: sans-serif;
                margin: 0;
                padding: 20px;
              }
              form {
                display: flex;
                flex-direction: column;
                gap: 10px;
              }
              label {
                font-weight: bold;
              }
              input[type="password"] {
                padding: 5px;
                border: 1px solid #ccc;
                border-radius: 4px;
              }
              button {
                background-color: #4CAF50;
                color: white;
                padding: 5px 10px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
              }
            </style>
          </head>
         <script>
           function formsubmitted(e){
                   e.preventDefault();
                  console.log('called')
                       }
                           </script>

                                   <form action="/password/updatepassword/${id}" method="get">
                                       <label for="newpassword">Enter New password</label>
                                       <input name="newpassword" type="password" required></input>
                                       <button>reset password</button>
                                   </form>
                               </html>
      `);
      res.end();
    }
  });
};

const updatepassword = async (req, res) => {
  try {
    const { newpassword } = req.query;
    const { resetpasswordid } = req.params;

    const resetPasswordRequest = await Forgotpassword.findOne({ 
      where: { id: resetpasswordid } 
    });

    if (!resetPasswordRequest) {
      return res.status(404).json({ error: 'Reset password request not found', success: false });
    }

    const user = await User.findOne({ 
      where: { id: resetPasswordRequest.userId } 
    });

    if (!user) {
      return res.status(404).json({ error: 'No user exists', success: false });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newpassword, saltRounds); 

    await user.update({ password: hashedPassword });

    return res.status(201).json({ message: 'Successfully updated the new password' });

  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({ error: 'Failed to update password', success: false }); 
  }
};


module.exports = {
   forgotpassword,
   updatepassword,
   resetpassword
}