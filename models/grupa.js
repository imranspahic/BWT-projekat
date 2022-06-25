const Sequelize = require('sequelize');
const db = require("../database");

module.exports = function (db, DataTypes) {
    const Grupa = db.define('Grupa', {
        naziv: Sequelize.STRING
    },
        {
            freezeTableName: true
        });
    return Grupa;
};