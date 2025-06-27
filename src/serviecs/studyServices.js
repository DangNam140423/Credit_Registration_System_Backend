require('dotenv').config();
import db from '../models/index';
import bcrypt from 'bcryptjs';
import { createJWT } from '../middleware/jwtAction';
const salt = bcrypt.genSaltSync(10);


const createStudy = async ({ id_class, id_student, id_semester }) => {
    const t = await db.sequelize.transaction();
    try {
        if (!id_class || !id_student || !id_semester) {
            return {
                EC: 1,
                EM: 'Thiếu dữ liệu'
            };
        }
        //Kiểm tra lớp học tồn tại trong học kỳ
        const classes = await db.Class.findOne({
            where: {
                id: id_class,
                id_semester: id_semester
            },
            lock: t.LOCK.UPDATE, // khóa row lại, đảm bảo chỉ 1 người được tương tác, người khác không thể dùng nếu người trước chưa commit()
            transaction: t,
            raw: false,
            nest: true,
        });

        if (!classes) {
            await t.rollback();
            return {
                EC: 1,
                EM: 'Lớp này không tồn tại'
            };
        }

        // Kiểm tra sinh viên đã đăng ký học phần tương ứng chưa
        const { rows } = await db.Study_Progress.findAndCountAll({
            where: { id_student },
            include: [
                {
                    model: db.Class,
                    as: 'classData',
                    attributes: ['id_module', 'day_of_week', 'start_lessons', 'end_lessons']
                }
            ],
            raw: false,
            nest: true
        });

        const isDuplicate = rows.some(
            (study) => study.classData?.id_module === classes.id_module
        );

        if (isDuplicate) {
            await t.rollback();
            return {
                EC: 2,
                EM: 'Học phần này đã được đăng ký'
            };
        }

        // Kiểm tra lịch học bị trùng
        const hasConflict = rows.some((study) => {
            const c = study.classData;
            return (
                c.day_of_week === classes.day_of_week  // cùng ngày trong tuần
                &&
                ((c.start_lessons <= classes.end_lessons) && (c.end_lessons >= classes.start_lessons))
            );
        });

        if (hasConflict) {
            await t.rollback();
            return {
                EC: 3,
                EM: 'Lịch học bị trùng với một lớp đã đăng ký'
            };
        }

        // Kiểm tra slot còn trống của lớp đó
        if (classes.fill_slots >= classes.total_slots) {
            await t.rollback();
            return {
                EC: 4,
                EM: 'Lớp đã đầy, không thể đăng ký thêm'
            };
        }

        // Tăng fill_slots lên 1
        classes.fill_slots += 1;
        await classes.save({ transaction: t });

        await db.Study_Progress.create({
            id_student,
            id_class,
            status: false
        }, { transaction: t });

        await t.commit();
        return {
            EC: 0,
            EM: 'Đăng ký thành công'
        };

    } catch (error) {
        await t.rollback();
        console.error(error);
        throw new Error(error.message);
    }
};

const getStudy = async ({ id_student, id_semester }) => {
    try {
        if (!id_student || !id_semester) {
            return {
                EC: 1,
                EM: 'Thiếu dữ liệu'
            };
        }

        const studies = await db.Study_Progress.findAll({
            where: {
                id_student: id_student
            },
            include: [
                {
                    model: db.Class,
                    as: 'classData',
                    where: { id_semester: id_semester },
                    // attributes: ['id','id_semester', 'id_module', 'id_room', 'start_lessons', 'end_lessons', 'day_of_week']
                }
            ],
            raw: false,
            nest: true
        });

        return {
            EC: 0,
            EM: 'OK',
            DT: studies
        };
    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
};

const cancelStudy = async ({ id_study, id_semester }) => {
    const t = await db.sequelize.transaction();
    try {
        if (!id_study || !id_semester) {
            await t.rollback();
            return {
                EC: 1,
                EM: 'Thiếu dữ liệu'
            };
        }

        // Kiểm tra study có tồn tại không
        const study = await db.Study_Progress.findOne({
            where: {
                id: id_study
            },
            raw: false,
            nest: true,
            transaction: t,
        });



        if (!study) {
            await t.rollback();
            return {
                EC: 2,
                EM: 'Lớp này không tồn tại, lấy gì hủy?'
            };
        }

        // Tìm class trong đúng học kỳ và lock dòng lại để tránh race condition
        const classes = await db.Class.findOne({
            where: {
                id: study.id_class,
                id_semester: id_semester
            },
            raw: false,
            nest: true,
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (classes.fill_slots <= 0) {
            await t.rollback();
            return {
                EC: 3,
                EM: 'Lớp không có sinh viên nào, không thể giảm tiếp'
            };
        }

        // Giảm slot
        classes.fill_slots -= 1;
        await classes.save({ transaction: t });

        // Xóa Study_Progress
        await study.destroy({ transaction: t });

        await t.commit();
        return {
            EC: 0,
            EM: 'Hủy lớp thành công'
        };

    } catch (error) {
        await t.rollback();
        console.error(error);
        throw new Error(error.message);
    }
}


module.exports = {
    createStudy, getStudy, cancelStudy
}

