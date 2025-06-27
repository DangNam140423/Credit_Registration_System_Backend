require('dotenv').config();
import bcrypt from 'bcryptjs';
import db from '../models/index';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { includes } from 'lodash';
const salt = bcrypt.genSaltSync(10);

let createClass = async (data) => {
    try {
        let {
            id_teacher,
            id_module, // môn học
            id_room,
            start_lessons, // tiết bắt đầu (1,2,3,4,5,6,7,8,9)
            end_lessons, // tiết kết thúc (2,3,4,5,6,7,8,9,10)
            total_slots, // số lượng sinh viên có thể đk lớp này
            day_of_week, // ngày trong tuần
            // start_day,   // ngày bắt đầu học
            // end_day,     // ngày kết thúc học
            count_week,  // tổng số tuần học
            semester     // học kì
        } = data;

        const semesterData = await db.Semester.findByPk(semester);

        if (!semesterData) {
            return { EC: 1, EM: 'Không tồn tại học kì này' };
        }

        const totalSemesterWeeks = Math.floor(
            (new Date(semesterData.end_date) - new Date(semesterData.start_date)) / (7 * 24 * 60 * 60 * 1000)
        );

        if (count_week > totalSemesterWeeks) {
            return { EC: 2, EM: 'Số tuần học vượt quá thời lượng học kỳ' };
        }

        // Kiểm tra lịch giảng viên có bị trùng
        let conflictTeacher = await db.Class.findOne({
            where: {
                id_teacher,
                day_of_week,
                id_semester: semester,
                // [Op.or]: [
                //     {
                //         start_lessons: {
                //             [Op.between]: [start_lessons, end_lessons] // tiết bắt đầu của lớp cũ nằm giữa khung giờ dạy mới
                //         }
                //     },
                //     {
                //         end_lessons: {
                //             [Op.between]: [start_lessons, end_lessons] // tiết kết thúc của lớp cũ nằm giữa khung giờ dạy mới 
                //         }
                //     },
                //     // Trường hợp 2 khung giờ giao nhau
                //     {
                //         [Op.and]: [
                //             { start_lessons: { [Op.lte]: start_lessons } },
                //             { end_lessons: { [Op.gte]: end_lessons } }
                //         ]
                //     }
                //     // Trường hợp khung giờ cũ chứa khung giờ mới
                // ],
                // Gọi A B là khung giờ mới: B > A
                // Gọi a b là khung giờ cũ: b > a
                // Ở đây vì tiết kết thúc luôn lớn hơn tiết bắt đầu nên ta có thể rút gọn điều kiện như sau:
                [Op.and]: [
                    { start_lessons: { [Op.lte]: end_lessons } }, // a <= B
                    { end_lessons: { [Op.gte]: start_lessons } }, // b >= A
                ]
            }
        });

        if (conflictTeacher) {
            return {
                EC: 3,
                EM: 'Lịch giảng dạy của giảng viên đã bị trùng.'
            };
        }

        // Kiểm tra phòng học có bị trùng giờ
        let conflictRoom = await db.Class.findOne({
            where: {
                id_room,
                day_of_week,
                id_semester: semester,
                // [Op.or]: [
                //     {
                //         start_lessons: {
                //             [Op.between]: [start_lessons, end_lessons]
                //         }
                //     },
                //     {
                //         end_lessons: {
                //             [Op.between]: [start_lessons, end_lessons]
                //         }
                //     },
                //     {
                //         [Op.and]: [
                //             { start_lessons: { [Op.lte]: start_lessons } },
                //             { end_lessons: { [Op.gte]: end_lessons } }
                //         ]
                //     }
                // ],
                [Op.and]: [
                    { start_lessons: { [Op.lte]: end_lessons } },
                    { end_lessons: { [Op.gte]: start_lessons } },
                ]
            }
        });

        if (conflictRoom) {
            return {
                EC: 4,
                EM: `Phòng ${id_room} đã được xử dụng trong khung giờ này`
            };
        }

        await db.Class.create({
            id_teacher,
            id_module,
            id_room,
            start_lessons,
            end_lessons,
            total_slots,
            day_of_week,
            // start_day,
            // end_day,
            count_week,
            id_semester: semester
        });

        return {
            EC: 0,
            EM: 'Ok',
            DT: ''
        };
    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
};


let deleteClass = async (data) => {
    try {
        let { id } = data;
        let classes = await db.Class.findByPk(id, {
            raw: false,
        });
        if (!classes) {
            return {
                EC: 1,
                EM: "Class isn't exist"
            }
        }

        await classes.destroy();
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


const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getDayCode = (dayIndex) => dayMap[dayIndex];

const getDayIndex = (dayCode) =>
    dayMap.findIndex(d => d.toLowerCase() === dayCode.toLowerCase());

function parseDateOnlyUTC(dateString) {
    const [year, month, day] = dateString.split('T')[0].split('-');
    return new Date(Date.UTC(year, month - 1, day)); // Tạo date 00:00 UTC
}

const getWeeklySchedule = async ({ semesterId, weekIndex }) => {
    try {
        if (!semesterId || !weekIndex) {
            return {
                EC: 1,
                EM: 'Missing parameter'
            }
        }
        const semester = await db.Semester.findByPk(semesterId);
        if (!semester) {
            return {
                EC: 2,
                EM: 'Semester not found'
            }
        }

        const semesterStart = new Date(semester.start_date);
        semesterStart.setHours(semesterStart.getHours() + 7);

        const weekStartDate = new Date(semesterStart);
        weekStartDate.setDate(semesterStart.getDate() + weekIndex * 7);

        const allClasses = await db.Class.findAll({
            include: [
                { model: db.Module, as: 'moduleData', attributes: ['id', 'name', 'credit'] },
                {
                    model: db.User, as: 'teacherData',
                    include: [
                        { model: db.Teacher, as: 'teacherData', attributes: ['department', 'degree'] }
                    ]
                },
            ],
            where: { id_semester: semesterId },
            raw: false,
            nest: true
        });

        const schedule = [];

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(weekStartDate); // Ngày bắt đầu của tuần (Mon)
            currentDate.setDate(weekStartDate.getDate() + i);

            const dayCode = getDayCode(currentDate.getDay()); // 'Sun', 'Mon', 'Tue', ...

            const dayClasses = allClasses.filter(cls => {
                const dayOfWeek = getDayCode(cls.day_of_week);
                if (dayOfWeek !== dayCode) return false; // Lớp không thuộc ngày currentDate

                // Xác định ngày bắt đầu thực tế của lớp học
                const classStartDayOffset = (getDayIndex(dayOfWeek) + 7 - semesterStart.getDay()) % 7;

                const classStartDate = new Date(semesterStart);
                classStartDate.setDate(semesterStart.getDate() + classStartDayOffset);

                const classEndDate = new Date(classStartDate);
                classEndDate.setDate(classStartDate.getDate() + (cls.count_week - 1) * 7);

                return currentDate >= classStartDate && currentDate <= classEndDate;
                // Trả ra những lớp có ngày bắt đầu và ngày kết thúc chứa ngày currentDate
            });

            schedule.push({
                day_of_week: dayCode,
                // date: currentDate.toISOString().split('T')[0],
                date: currentDate,
                classes: dayClasses
            });
        }

        return {
            EC: 0,
            EM: 'Ok',
            DT: schedule
        };
    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
}

const getRoomEmpty = async ({ dayOfWeek, lessonStart, lessonEnd, semesterId }) => {
    try {
        if (!Number.isInteger(parseInt(dayOfWeek)) || !lessonStart || !lessonEnd || !semesterId) {
            return {
                EC: 1,
                EM: 'Missing parameter'
            }
        }
        let arrRoom = await db.Room.findAll();

        let arrClass = await db.Class.findAll({
            where: {
                id_semester: semesterId,
                day_of_week: dayOfWeek,
            }
        });

        let rooms = arrClass.map((item) => { // lấy danh sách các room đã được chọn cho các lớp khác
            let start_lessons = item.start_lessons;
            let end_lessons = item.end_lessons;

            // Gọi A B là khung giờ mới: B > A
            // Gọi a b là khung giờ cũ: b > a
            // Ở đây vì tiết kết thúc luôn lớn hơn tiết bắt đầu nên ta có điều kiện như sau: B >= a và A <= b
            if (lessonEnd >= start_lessons && lessonStart <= end_lessons) {
                return item.id_room;
            }
        });


        let result = arrRoom.filter(room => !rooms.includes(room.id));

        return {
            EC: 0,
            EM: 'Ok',
            DT: result
        }
    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
}

const getTeacherFree = async ({ dayOfWeek, lessonStart, lessonEnd, semesterId }) => {
    try {
        if (!Number.isInteger(parseInt(dayOfWeek)) || !lessonStart || !lessonEnd || !semesterId) {
            return {
                EC: 1,
                EM: 'Missing parameter'
            }
        }
        let arrTeacher = await db.User.findAll({
            where: { role: 'R2' },
            include: [{ model: db.Teacher, as: 'teacherData', attributes: ['degree'] }],
            raw: false,
            nest: true
        });

        let arrClass = await db.Class.findAll({
            where: {
                id_semester: semesterId,
                day_of_week: dayOfWeek,
            }
        });

        let teachers = arrClass.map((item) => { // lấy danh sách các giảng viên đã được chọn cho các lớp khác vaof khung giờ này
            let start_lessons = item.start_lessons;
            let end_lessons = item.end_lessons;

            // Gọi A B là khung giờ mới: B > A
            // Gọi a b là khung giờ cũ: b > a
            // Ở đây vì tiết kết thúc luôn lớn hơn tiết bắt đầu nên ta có điều kiện như sau: B >= a và A <= b
            if (lessonEnd >= start_lessons && lessonStart <= end_lessons) {
                return item.id_teacher;
            }
        });


        let result = arrTeacher.filter(teacher => !teachers.includes(teacher.id));

        return {
            EC: 0,
            EM: 'Ok',
            DT: result
        }
    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
}

const openSemester = async ({ id_semester }) => {
    try {
        const { count, rows } = await db.Class.findAndCountAll({
            where: { id_semester: id_semester },
        });

        const semesterData = await db.Semester.findByPk(id_semester, {
            raw: false
        });

        if (count <= 0) {
            return {
                EC: 1,
                EM: `Không có lớp học nào trong ${semesterData.name}`
            }
        }

        await semesterData.update({
            status: 1
        });

        return {
            EC: 0,
            EM: 'OK',
            DT: semesterData.id
        }

    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
}

const getAllClass = async ({ id_semester }) => {
    try {
        const semesterData = await db.Semester.findByPk(id_semester);
        if (semesterData.status === 0) {
            return {
                EC: 1,
                EM: 'Học kì này vẫn chưa được mở đăng ký',
                DT: []
            }
        }
        const allClasses = await db.Class.findAll({
            include: [
                { model: db.Module, as: 'moduleData', attributes: ['id', 'name', 'credit'] },
                {
                    model: db.User, as: 'teacherData',
                    include: [
                        { model: db.Teacher, as: 'teacherData', attributes: ['department', 'degree'] }
                    ]
                },
            ],
            where: { id_semester: id_semester },
            raw: false,
            nest: true
        });

        const semesterStartDate = new Date(semesterData.start_date); // Giả sử ngày bắt đầu học kỳ đã có trong DB

        const result = allClasses.map((cls) => {
            const startDate = new Date(semesterStartDate);
            startDate.setHours(semesterStartDate.getHours() + 7);

            const dayOffset = cls.day_of_week - 1; // vì thứ 2 = 1 → offset = 0
            startDate.setDate(startDate.getDate() + dayOffset);

            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + (cls.count_week - 1) * 7);

            return {
                ...cls.toJSON(),
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0]
            };
        });

        const groupedByModule = result.reduce((acc, cls) => {
            const moduleId = cls.id_module;

            if (!acc[moduleId]) {
                acc[moduleId] = [];
            }

            acc[moduleId].push(cls);
            return acc;
        }, {});


        return {
            EC: 0,
            EM: 'OK',
            DT: groupedByModule
        };

    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
}



module.exports = {
    createClass, deleteClass, getWeeklySchedule, getRoomEmpty, getTeacherFree,
    openSemester,
    getAllClass
}