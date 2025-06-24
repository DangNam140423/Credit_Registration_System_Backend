require('dotenv').config();
import bcrypt from 'bcryptjs';
import db from '../models/index';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
const salt = bcrypt.genSaltSync(10);

let getAllModule = async () => {
    try {
        let result = await db.Module.findAll();
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

function removeVietnameseTones(str) {
    return str
        .normalize('NFD') // Tách các dấu ra khỏi chữ cái
        .replace(/[\u0300-\u036f]/g, '') // Xoá các dấu thanh: sắc, huyền, hỏi, ngã, nặng
        .replace(/đ/g, 'd').replace(/Đ/g, 'D') // Đặc biệt cho chữ đ/Đ
        .replace(/ă|â|á|à|ả|ã|ạ|ắ|ằ|ẳ|ẵ|ặ|ấ|ầ|ẩ|ẫ|ậ/g, 'a')
        .replace(/ê|é|è|ẻ|ẽ|ẹ|ế|ề|ể|ễ|ệ/g, 'e')
        .replace(/í|ì|ỉ|ĩ|ị/g, 'i')
        .replace(/ô|ơ|ó|ò|ỏ|õ|ọ|ố|ồ|ổ|ỗ|ộ|ớ|ờ|ở|ỡ|ợ/g, 'o')
        .replace(/ư|ú|ù|ủ|ũ|ụ|ứ|ừ|ử|ữ|ự/g, 'u')
        .replace(/ý|ỳ|ỷ|ỹ|ỵ/g, 'y')
        .replace(/Ă|Â|Á|À|Ả|Ã|Ạ|Ắ|Ằ|Ẳ|Ẵ|Ặ|Ấ|Ầ|Ẩ|Ẫ|Ậ/g, 'A')
        .replace(/Ê|É|È|Ẻ|Ẽ|Ẹ|Ế|Ề|Ể|Ễ|Ệ/g, 'E')
        .replace(/Í|Ì|Ỉ|Ĩ|Ị/g, 'I')
        .replace(/Ô|Ơ|Ó|Ò|Ỏ|Õ|Ọ|Ố|Ồ|Ổ|Ỗ|Ộ|Ớ|Ờ|Ở|Ỡ|Ợ/g, 'O')
        .replace(/Ư|Ú|Ù|Ủ|Ũ|Ụ|Ứ|Ừ|Ử|Ữ|Ự/g, 'U')
        .replace(/Ý|Ỳ|Ỷ|Ỹ|Ỵ/g, 'Y');
}


function generateCodePrefix(name) {
    let clean = removeVietnameseTones(name);
    return clean
        .trim()
        .split(/[\s&–\-+,/()]+/)
        .map(word => word[0].toUpperCase())
        .join('');
}

let createModule = async (data) => {
    try {
        let { name, credit } = data;

        let prefix = generateCodePrefix(name);
        let count = await db.Module.count({
            where: {
                name: {
                    [Op.like]: `${prefix}%`
                }
            }
        });
        let nextNumber = count + 1;
        let numberPart = String(nextNumber).padStart(3, '0');
        let courseCode = `${prefix}-${numberPart}`;

        await db.Module.create({
            id: courseCode,
            name,
            credit
        });
        return {
            EC: 0,
            EM: 'Ok',
            DT: courseCode
        }
    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
}


let deleteModule = async (data) => {
    try {
        let { id } = data;
        let module = await db.Module.findByPk(id, {
            raw: false,
        });
        if (!module) {
            return {
                EC: 1,
                EM: "Module isn't exist"
            }
        }

        await module.destroy();
        return {
            EC: 0,
            EM: 'OK',
            DT: id
        }
    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
}

module.exports = {
    getAllModule, createModule, deleteModule
}
