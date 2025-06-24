require('dotenv').config();
import bcrypt from 'bcryptjs';
import db from '../models/index';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
const salt = bcrypt.genSaltSync(10);

let getAllDepartment = async () => {
    try {
        let result = await db.Department.findAll();
        return {
            EC: 0,
            EM: 'Success',
            DT: result,
        };
    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
};

module.exports = {
    getAllDepartment,
}
