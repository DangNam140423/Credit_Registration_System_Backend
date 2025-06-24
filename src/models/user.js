'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasOne(models.Teacher, { foreignKey: 'id_user', as: 'teacherData' });
      User.hasOne(models.Student, { foreignKey: 'id_user', as: 'studentData' });
      User.hasMany(models.Tuition, { foreignKey: 'id_student', as: 'tuitionData' });
      User.hasMany(models.Class, { foreignKey: 'id_teacher', as: 'teachingClasses' });
      User.hasMany(models.Study_Progress, { foreignKey: 'id_student', as: 'studyProgress' });
    }
  };
  User.init({
    role: DataTypes.STRING,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    birthday: DataTypes.DATE,
    gender: DataTypes.STRING,
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    avatar: DataTypes.STRING,
    token: DataTypes.STRING,
    status: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};