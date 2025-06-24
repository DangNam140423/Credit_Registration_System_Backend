'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Room extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Room.hasMany(models.Class, { foreignKey: 'id_room', as: 'classData' });
        }
    };
    Room.init({
        type: DataTypes.STRING,
        total_seats: DataTypes.TINYINT,
    }, {
        sequelize,
        modelName: 'Room',
    });
    return Room;
};