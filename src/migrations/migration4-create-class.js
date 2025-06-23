'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Classes', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            id_module: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'Modules',
                    key: 'id',
                },
            },
            id_teacher: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'Users',
                    key: 'id',
                },
            },
            total_slots : {
                allowNull: false,
                type: Sequelize.TINYINT,
            },
            day_of_week: { // thứ trong tuần
                allowNull: false,
                type: Sequelize.TINYINT,
            },
            start_day: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            end_day: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            count_week: {
                allowNull: false,
                type: Sequelize.TINYINT,
            },
            semester: {
                allowNull: false,
                type: Sequelize.TINYINT,
            },
            room: {
                allowNull: true,
                type: Sequelize.STRING
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
        await queryInterface.dropTable('Classes');
    }
};