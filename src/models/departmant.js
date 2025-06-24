'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Department extends Model {
        static associate(models) {
            Department.hasMany(models.Student, { foreignKey: 'department', as: 'studentData' });
            Department.hasMany(models.Teacher, { foreignKey: 'department', as: 'teacherData' });
        }
    };
    Department.init({
        name: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'Department',
    });
    return Department;
};


