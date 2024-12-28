const express = require('express');
const app = express();
const dotenv = require('dotenv');

dotenv.config();

const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const cors = require('cors');
const sequelize = require('./util/database');
const User = require('./models/users');
const Expense = require('./models/expenses');
const Order = require('./models/orders')
const Forgotpassword = require('./models/forgotpassword');
const DownloadedContent = require('./models/contentloaded');


const userRoutes = require('./routes/user');  // Importing user routes
const expenseRoutes = require('./routes/expenses');
const purchaseRoutes = require('./routes/purchase');
const premiumFeatureRoutes = require('./routes/premiumFeature')
const resetPasswordRoutes = require('./routes/resetpassword')



const accessLogStream = fs.createWriteStream(
  path.join(__dirname,'access.log'),
  { flags: 'a'});


app.use(cors());  // Allows cross-origin requests


app.use(morgan('combined',{stream: accessLogStream}));
app.use(express.json());


 

 // Serve static files for other routes
app.use(express.static(path.join(__dirname, 'public')));


app.use('/user', userRoutes);  // Use /user routes for user operations
app.use('/expenses',expenseRoutes);
app.use('/purchase',purchaseRoutes);
app.use('/premium', premiumFeatureRoutes)
app.use('/password', resetPasswordRoutes);


Expense.belongsTo(User);
User.hasMany(Expense);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

User.hasMany(DownloadedContent);
DownloadedContent.belongsTo(User);

sequelize.sync()
  .then(() => {
    app.listen(3000);
  })
  .catch(err => {
    console.error(err);
  });

// Once the email is entered for password reset, generate the reset link.
// Open the link generation process and manually insert the user ID after the reset link.
// Note: The email sending API is not registered, so email will not be sent automatically.
