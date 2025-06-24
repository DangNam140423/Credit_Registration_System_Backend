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
        id_student: DataTypes.INTEGER,
        id_class: DataTypes.INTEGER,
        participation_grade: DataTypes.TINYINT,
        midterm_grade: DataTypes.TINYINT,
        final_grade: DataTypes.TINYINT,
        status: DataTypes.BOOLEAN,
    }, {
        sequelize,
        modelName: 'Study_Progress',
    });
    return Study_Progress;
};


