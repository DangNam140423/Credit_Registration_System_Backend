'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Study_Progress extends Model {
        static associate(models) {
            Study_Progress.belongsTo(models.User, { foreignKey: 'id_student', as: 'studentData' });
            Study_Progress.belongsTo(models.Class, { foreignKey: 'id_class', as: 'classData' });
        }
    };
    Study_Progress.init({
        id_module: DataTypes.INTEGER,
        id_student: DataTypes.INTEGER,
        count_slot: DataTypes.TINYINT,
        day_of_week: DataTypes.TINYINT,
        start_day: DataTypes.TINYINT,
        end_day: DataTypes.TINYINT,
        count_week: DataTypes.TINYINT,
        semester: DataTypes.TINYINT,
        room: DataTypes.TINYINT,
    }, {
        sequelize,
        modelName: 'Study_Progress',
    });
    return Study_Progress;
};


