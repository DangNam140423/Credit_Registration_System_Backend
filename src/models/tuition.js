'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Tuition extends Model {
        static associate(models) {
            Tuition.belongsTo(models.User, { foreignKey: 'id_student', targetKey: 'id', as: 'studentData' })
        }
    };
    Tuition.init({
        id_student: DataTypes.INTEGER,
        credit: DataTypes.TINYINT,
        semester: DataTypes.STRING,
        tuition: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'Tuition',
    });
    return Tuition;
};


