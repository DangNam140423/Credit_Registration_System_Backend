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
            id_semester: {
                allowNull: false,
                type: Sequelize.TINYINT,
                references: {
                    model: 'Semesters',
                    key: 'id',
                },
            },
            id_module: {
                allowNull: false,
                type: Sequelize.STRING,
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
            id_room: {
                allowNull: true,
                type: Sequelize.STRING,
                references: {
                    model: 'Rooms',
                    key: 'id',
                },
            },
            start_lessons: {
                allowNull: false,
                type: Sequelize.TINYINT,
            },
            end_lessons: {
                allowNull: false,
                type: Sequelize.TINYINT,
            },
            total_slots: {
                allowNull: false,
                type: Sequelize.TINYINT,
            },
            day_of_week: { // thứ trong tuần
                allowNull: false,
                type: Sequelize.TINYINT,
            },
            start_date: {
                allowNull: true,
                type: Sequelize.DATE,
            },
            end_date: {
                allowNull: true,
                type: Sequelize.DATE,
            },
            count_week: {
                allowNull: false,
                type: Sequelize.TINYINT,
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