const Sequelize = require('sequelize');
const db = require("../database");

module.exports = function (db, DataTypes) {
    const Student = db.define('Student', {
        ime: Sequelize.STRING,
        prezime: Sequelize.STRING,
        index: {
            type: Sequelize.STRING(10),
            unique: true,
            allowNull: false
        },
        grupaId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Grupa',
                key: 'id'
            }
        }
    },
        {
            freezeTableName: true
        });
    return Student;
};