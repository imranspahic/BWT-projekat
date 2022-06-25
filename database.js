const Sequelize = require('sequelize');

module.exports = new Sequelize('student', 'root', '', {
    host: "127.0.0.1",
    dialect: "mysql",
    port: "3308",
});