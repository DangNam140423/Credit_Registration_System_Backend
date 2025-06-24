'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Teacher extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Teacher.belongsTo(models.User, { foreignKey: 'id_user', as: 'userData' });
            Teacher.belongsTo(models.Department, { foreignKey: 'department', as: 'departmentData' });
        }
    };
    Teacher.init({
        id_user: DataTypes.INTEGER,
        department: DataTypes.STRING,
        degree: DataTypes.STRING,
        major: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'Teacher',
    });
    return Teacher;
};