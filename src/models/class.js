'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Class extends Model {
        static associate(models) {
            Class.belongsTo(models.User, { foreignKey: 'id_teacher', as: 'teacherData' });
            Class.belongsTo(models.Module, { foreignKey: 'id_module', as: 'moduleData' });
            Class.hasMany(models.Study_Progress, { foreignKey: 'id_class', as: 'progressData' });
        }
    };
    Class.init({
        id_module: DataTypes.INTEGER,
        id_teacher: DataTypes.INTEGER,
        total_slots: DataTypes.TINYINT,
        day_of_week: DataTypes.TINYINT,
        start_day: DataTypes.TINYINT,
        end_day: DataTypes.TINYINT,
        count_week: DataTypes.TINYINT,
        semester: DataTypes.TINYINT,
        room: DataTypes.TINYINT,
    }, {
        sequelize,
        modelName: 'Class',
    });
    return Class;
};


