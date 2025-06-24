'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Study_Progress', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            id_student: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'Users',
                    key: 'id',
                },
            },
            id_class: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'Classes',
                    key: 'id',
                },
            },
            participation_grade: { // điểm chuyên cần
                type: Sequelize.TINYINT,
                defaultValue: null
            },
            midterm_grade: { // điểm giữa kỳ
                type: Sequelize.TINYINT,
                defaultValue: null
            },
            final_grade: { // điểm cuối kỳ
                type: Sequelize.TINYINT,
                defaultValue: null
            },
            status: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Study_Progress');
    }
};