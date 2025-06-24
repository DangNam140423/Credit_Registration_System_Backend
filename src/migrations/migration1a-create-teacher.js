'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Teachers', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            id_user: {
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: true, // đảm bảo quan hệ 1-1 với users
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            department: {  // Khoa
                allowNull: false,
                type: Sequelize.STRING,
                references: {
                    model: 'departments',
                    key: 'id'
                },
            },
            degree: { // học vị: ThS,TS, PGS, GS
                allowNull: false,
                type: Sequelize.STRING
            },
            major: {  // Chuyên ngành
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
        await queryInterface.dropTable('Teachers');
    }
};