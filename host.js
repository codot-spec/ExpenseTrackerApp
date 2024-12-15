const express = require('express');
const bodyParser = require('body-parser');

const cors = require('cors');
const sequelize = require('./util/database');

const app = express();
const userRoutes = require('./routes/user');  // Importing user routes

app.use(cors());  // Allows cross-origin requests

app.use(bodyParser.json());  // Use JSON for API requests
app.use('/user', userRoutes);  // Use /user routes for user operations

sequelize.sync()
  .then(() => {
    console.log('User table created successfully')
  })
  .catch(err => {
    console.error(err);
  });


  app.listen(3000,()=>{
    console.log('Server listening on port 3000');
  });

