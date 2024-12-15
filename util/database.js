const Sequelize=require('sequelize');

const sequelize=new Sequelize('expense','root','somegudencrypt',{
    dialect: 'mysql',
    host: 'localhost',
    port: 3306
});

module.exports=sequelize;