const Sequelize = require('sequelize');
const sequelize = require('../util/database');


const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name:Sequelize.STRING,
  email: {
    type: Sequelize.STRING,
    unique: true,
  },
  password: Sequelize.STRING,
  totalExpenses:{
    type: Sequelize.FLOAT,
    defaultValue: 0
  },
  isPremium:Sequelize.BOOLEAN,
});


module.exports = User;