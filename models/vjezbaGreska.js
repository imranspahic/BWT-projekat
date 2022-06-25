const Sequelize = require('sequelize');
const db = require("../database");

module.exports = function (db, DataTypes) {
    const VjezbaGreska = db.define('VjezbaGreska', {
        naziv: Sequelize.STRING,
        vjezbaId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Vjezba',
                key: 'id'
            }
        }
    },
        {
            freezeTableName: true
        });
    return VjezbaGreska;
};