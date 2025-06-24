'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Class extends Model {
        static associate(models) {
            Class.belongsTo(models.Semester, { foreignKey: 'id_semester', targetKey: 'id', as: 'semesterData' });
            Class.belongsTo(models.User, { foreignKey: 'id_teacher', as: 'teacherData' });
            Class.belongsTo(models.Module, { foreignKey: 'id_module', as: 'moduleData' });
            Class.belongsTo(models.Room, { foreignKey: 'id_room', as: 'roomData' });
            Class.hasMany(models.Study_Progress, { foreignKey: 'id_class', as: 'progressData' });
        }
    };
    Class.init({
        id_semester: DataTypes.TINYINT,
        id_module: DataTypes.STRING,
        id_teacher: DataTypes.INTEGER,
        id_room: DataTypes.STRING,
        start_lessons: DataTypes.TINYINT,
        end_lessons: DataTypes.TINYINT,
        total_slots: DataTypes.TINYINT,
        day_of_week: DataTypes.TINYINT,
        start_date: DataTypes.DATE,
        end_date: DataTypes.DATE,
        count_week: DataTypes.TINYINT,
    }, {
        sequelize,
        modelName: 'Class',
    });
    return Class;
};


