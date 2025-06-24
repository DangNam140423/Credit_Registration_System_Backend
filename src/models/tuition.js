'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Tuition extends Model {
        static associate(models) {
            Tuition.belongsTo(models.User, { foreignKey: 'id_student', targetKey: 'id', as: 'studentData' });
            Tuition.belongsTo(models.Semester, { foreignKey: 'id_semester', targetKey: 'id', as: 'semesterData' });
        }
    };
    Tuition.init({
        id_semester: DataTypes.TINYINT,
        id_student: DataTypes.INTEGER,
        credit: DataTypes.TINYINT,
        tuition: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'Tuition',
    });
    return Tuition;
};


