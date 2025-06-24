'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Student extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Student.belongsTo(models.User, { foreignKey: 'id_user', as: 'userData' });
            Student.belongsTo(models.Department, { foreignKey: 'department', as: 'departmentData' });
        }
    };
    Student.init({
        id_user: DataTypes.INTEGER,
        department: DataTypes.STRING,
        student_code: DataTypes.STRING,
        class_name: DataTypes.STRING,
        major: DataTypes.STRING,
        course_year: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'Student',
    });
    return Student;
};