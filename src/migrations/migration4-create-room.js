'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Rooms', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.STRING
            },
            type: {
                allowNull: true,
                type: Sequelize.STRING
            },
            total_seats: {
                allowNull: false,
                type: Sequelize.TINYINT
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
        await queryInterface.dropTable('Rooms');
    }
};