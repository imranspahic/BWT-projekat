const Sequelize = require('sequelize');
const db = require("../database");

module.exports = function (db, DataTypes) {
    const Vjezba = db.define('Vjezba', {
        brojVjezbe: Sequelize.INTEGER,
        tacnost: Sequelize.STRING,
        promjena: Sequelize.STRING,
        indexStudenta: {
            type: Sequelize.STRING(10),
            references: {
                model: 'Student',
                key: 'index'
            }
        }
    },
        {
            freezeTableName: true
        });
    return Vjezba;
};