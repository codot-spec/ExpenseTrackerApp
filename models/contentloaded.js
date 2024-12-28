const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const DownloadedContent = sequelize.define('DownloadedContent', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  url: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  filename: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});


module.exports = DownloadedContent;
