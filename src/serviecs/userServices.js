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


const generateStudentCode = async (department_student, courseYear) => {
    const year = courseYear.toString().slice(-2); // '21' từ 2021

    // Tìm mã gần nhất cùng năm và mã ngành
    const latest = await db.Student.findOne({
        where: {
            student_code: {
                [Op.like]: `${year}${department_student}%`
            }
        },
        order: [['student_code', 'DESC']]
    });

    let nextIndex = 1; // cho student đầu tiên trong bảng
    if (latest) {
        const latestCode = latest.student_code;
        const numberPart = latestCode.slice(-4); // phần số cuối: 0001 → 0002
        nextIndex = parseInt(numberPart) + 1;
    }

    const paddedIndex = String(nextIndex).padStart(4, '0'); // luôn 4 chữ số
    return `${year}${department_student}${paddedIndex}`;
};

const createNewUser = async (data) => {
    const t = await db.sequelize.transaction();
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
            avatar,
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
        }, { transaction: t });


        // Tạo bản ghi mở rộng
        if (role === 'R2') {
            const { degree, department_teacher, major_teacher } = data;

            if (!degree || !department_teacher) {
                await t.rollback();
                return {
                    EC: 4,
                    EM: 'Missing data for teacher',
                };
            }

            await db.Teacher.create({
                id_user: newUser.dataValues.id,
                degree,
                department: department_teacher,
                major: major_teacher
            }, { transaction: t });
        } else if (role === 'R3') {
            const { course_year, major_student, class_name, department_student } = data;

            if (!course_year || !class_name || !department_student) {
                await t.rollback();
                return {
                    EC: 4,
                    EM: 'Missing data for student',
                };
            }

            const student_code = await generateStudentCode(department_student, course_year);

            await db.Student.create({
                id_user: newUser.dataValues.id,
                student_code,
                department: department_student,
                major: major_student,
                class_name,
                course_year
            }, { transaction: t });
        }

        // Gửi mail xác thực
        // const token = uuidv4();
        // await sendMailServices.handleSendMailAuth({
        //     dataUser: newUser.dataValues,
        //     redirectLink: buildUrlEmail(newUser.dataValues, token),
        // });
        // Cập nhật token xác thực
        // await newUser.update({ token });

        await t.commit();
        return {
            EC: 0,
            EM: 'Create a new user success',
        };

    } catch (error) {
        await t.rollback();
        console.error('Create user error:', error.message);
        throw new Error('Internal server error');
    }
};

const deleteUser = async (idUser) => {
    const ADMIN_ID = 1;
    if (!idUser) return { EC: 1, EM: 'Missing input parameter!' };
    if (idUser === ADMIN_ID) return { EC: 3, EM: 'Tài khoản Admin, không được chạm vào!' };

    const t = await db.sequelize.transaction();
    try {
        const user = await db.User.findByPk(idUser, {
            raw: false,
        });
        if (!user) return { EC: 2, EM: "The user doesn't exist!" };

        if (user.role === 'R2') {
            await db.Teacher.destroy({ where: { id_user: idUser }, transaction: t });
        } else if (user.role === 'R3') {
            await db.Student.destroy({ where: { id_user: idUser }, transaction: t });
        }

        await user.destroy({ transaction: t }); // dùng instance method, tránh query lần nữa
        await t.commit();

        return { EC: 0, EM: 'Delete user success.' };
    } catch (error) {
        await t.rollback();
        console.error('Delete user error:', error);
        throw new Error('Internal server error');
    }
};

const editUser = async (dataUser) => {
    const ADMIN_ID = 1;
    const t = await db.sequelize.transaction();

    try {
        const {
            id, name, address, gender, phone, role, birthday, avatar,
            degree, department_teacher, major_teacher, // for teacher
            course_year, major_student, class_name, department_student // for student
        } = dataUser;

        if (+id === ADMIN_ID) return { EC: 3, EM: 'Tài khoản này là Admin, không được chạm vào!' };

        if (!id || !name?.trim() || !address?.trim() || !phone || !birthday || !gender || !role) {
            return { EC: 1, EM: 'Missing input parameters!' };
        }

        const user = await db.User.findByPk(idUser, {
            raw: false,
        });
        if (!user) return { EC: 2, EM: 'User not found!' };

        await user.update({
            name, address, gender, phone, role, birthday,
            ...(avatar && { avatar }),
        }, { transaction: t });

        if (role === 'R2') {
            await db.Teacher.update(
                {
                    degree,
                    department: department_teacher,
                    major: major_teacher
                },
                { where: { id_user: id }, transaction: t }
            );
        } else if (role === 'R3') {
            await db.Student.update(
                {
                    major: major_student,
                    department: department_student,
                    class_name,
                    course_year
                },
                { where: { id_user: id }, transaction: t }
            );
        }

        await t.commit();
        return { EC: 0, EM: 'Update user succeeds' };

    } catch (error) {
        await t.rollback();
        console.error('Edit user error:', error);
        throw new Error('Internal server error');
    }
};


module.exports = {
    getAllUsers, createNewUser, deleteUser, editUser
}

