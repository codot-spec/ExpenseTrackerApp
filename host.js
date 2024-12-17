const express = require('express');
//const bodyParser = require('body-parser');

const cors = require('cors');
const sequelize = require('./util/database');
const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/orders')

const userRoutes = require('./routes/user');  // Importing user routes
const expenseRoutes = require('./routes/expenses');
const purchaseRoutes = require('./routes/purchase');


const app = express();
const dotenv = require('dotenv');
//app.use(bodyParser.json());  // Use JSON for API requests

dotenv.config();

app.use(cors());  // Allows cross-origin requests

app.use(express.json());

app.use('/user', userRoutes);  // Use /user routes for user operations
app.use('/expenses',expenseRoutes);
app.use('/purchase',purchaseRoutes);

Expense.belongsTo(User, {contraints: true, onDelete: 'CASCADE'});
User.hasMany(Expense);

User.hasMany(Order);
Order.belongsTo(User);

sequelize.sync()
  .then(() => {
    app.listen(3000);
  })
  .catch(err => {
    console.error(err);
  });


