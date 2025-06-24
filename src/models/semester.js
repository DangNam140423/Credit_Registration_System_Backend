'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Semester extends Model {
        static associate(models) {
            Semester.hasMany(models.Tuition, { foreignKey: 'id_semester', as: 'tuitionData' });
            Semester.hasMany(models.Class, { foreignKey: 'id_semester', as: 'classData' });
        }
    };
    Semester.init({
        name: DataTypes.STRING,
        start_date: DataTypes.DATE,
        end_date: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'Semester',
    });
    return Semester;
};


