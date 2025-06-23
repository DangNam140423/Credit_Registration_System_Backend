require('dotenv').config();
import bcrypt from 'bcryptjs';
import db from '../models/index';
import { v4 as uuidv4 } from 'uuid';
import sendMailServices from './sendMailServices';
import { Op } from 'sequelize';
const salt = bcrypt.genSaltSync(10);

let getAllUsers = async (userId, page, limit, role) => {
    try {
        page = Math.max(+page || 1, 1);
        limit = Math.max(+limit || 10);
        let offset = (page - 1) * limit;

        let whereCondition = {
            role: {
                [Op.in]: ['R2', 'R3'],// Chỉ lấy teacher và student
            },
        };

        // Nếu chỉ lấy 1 user cụ thể
        if (userId && userId !== 'ALL') {
            whereCondition.id = +userId;

        }


        const { count, rows } = await db.User.findAndCountAll({
            where: whereCondition,
            attributes: { exclude: ['password', 'token'] },
            order: [['role', 'ASC'], ['id', 'ASC']],
            offset,
            limit,
            raw: true,
            nest: true,
        });

        const totalPages = Math.ceil(count / limit);

        const result = {
            totalRows: count,
            totalPages,
            currentPage: page,
            limit,
            dataUser: rows,
        };

        // Nếu userId cụ thể nhưng không tìm thấy
        if (userId && userId !== 'ALL' && count === 0) {
            return {
                EC: 2,
                EM: 'User not found!',
                DT: result,
            };
        }

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


let checkUserEmail = async (userEmail) => {
    try {
        let user = await db.User.findOne({
            where: { email: userEmail }
        });
        return user ? true : false;
    } catch (error) {
        throw new Error(error.message);
    }
}


let hashUserPassword = async (password) => {
    try {
        var hashPassword = await bcrypt.hashSync(password, salt);
        return hashPassword;
    } catch (error) {
        throw new Error(error.message);
    }
}


let buildUrlEmail = (userData, token) => {
    return `${process.env.URL_REACT}/verify-user?token=${token}&userId=${userData.id}`;
}

const createNewUser = async (data) => {
    try {
        const {
            email,
            password,
            name,
            address,
            phone,
            gender,
            role,
            birthday,
            avatar
        } = data;

        // Kiểm tra input
        if (
            !email?.trim() || !password?.trim() || !name?.trim() ||
            !phone || !role
        ) {
            return {
                EC: 1,
                EM: 'Missing input parameters',
            };
        }

        // Kiểm tra email trùng
        const emailExists = await checkUserEmail(email);
        if (emailExists) {
            return {
                EC: 2,
                EM: 'This email is already in use!',
            };
        }

        // Hash password
        const hashedPassword = await hashUserPassword(password);

        // Tạo user
        const newUser = await db.User.create({
            name,
            email,
            password: hashedPassword,
            address,
            gender,
            phone,
            role,
            birthday,
            avatar,
            status: true,
        });

        if (!newUser) {
            return {
                EC: 3,
                EM: 'Create new user failed',
            };
        }

        // Gửi mail xác thực
        const token = uuidv4();
        await sendMailServices.handleSendMailAuth({
            dataUser: newUser.dataValues,
            redirectLink: buildUrlEmail(newUser.dataValues, token),
        });

        // Cập nhật token xác thực
        await newUser.update({ token });

        return {
            EC: 0,
            EM: 'Create a new user success',
        };

    } catch (error) {
        console.error('Create user error:', error);
        throw new Error('Internal server error');
    }
};


const deleteUser = async (idUser) => {
    const ADMIN_ID = 1;

    if (!idUser) {
        return {
            EC: 1,
            EM: 'Missing input parameter!',
        };
    }

    if (idUser === ADMIN_ID) {
        return {
            EC: 3,
            EM: 'Tài khoản Admin, không được chạm vào!',
        };
    }

    try {
        const user = await db.User.findByPk(idUser);

        if (!user) {
            return {
                EC: 2,
                EM: "The user doesn't exist!",
            };
        }

        await user.destroy(); // dùng instance method, tránh query lần nữa
        return {
            EC: 0,
            EM: 'Delete user success.',
        };
    } catch (error) {
        console.error('Delete user error:', error);
        throw new Error('Internal server error');
    }
};


const editUser = async (dataUser) => {
    const ADMIN_ID = 1;

    try {
        const {
            id,
            name,
            address,
            gender,
            phone,
            role,
            birthday,
            avatar,
        } = dataUser;

        // Ngăn sửa admin
        if (+id === ADMIN_ID) {
            return {
                EC: 3,
                EM: 'Tài khoản này là Admin, không được chạm vào!',
            };
        }

        // Kiểm tra đầu vào
        if (
            !id || !name?.trim() || !address?.trim() || !phone ||
            !birthday || !gender || !role
        ) {
            return {
                EC: 1,
                EM: 'Missing input parameters!',
            };
        }

        // Tìm user
        const user = await db.User.findByPk(id);
        if (!user) {
            return {
                EC: 2,
                EM: 'User not found!',
            };
        }

        // Cập nhật dữ liệu
        await user.update({
            name,
            address,
            gender,
            phone,
            role,
            birthday,
            ...(avatar && { avatar }), // chỉ cập nhật avatar nếu có
        });

        return {
            EC: 0,
            EM: 'Update user succeeds',
        };

    } catch (error) {
        console.error('Edit user error:', error);
        throw new Error('Internal server error');
    }
};



module.exports = {
    getAllUsers, createNewUser, deleteUser, editUser
}

