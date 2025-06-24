require('dotenv').config();
import bcrypt from 'bcryptjs';
import db from '../models/index';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
const salt = bcrypt.genSaltSync(10);

let createClass = async (data) => {
    try {
        let {
            id_teacher,
            id_module, // môn học
            id_room,
            start_lessons, // tiết bắt đầu (1,2,3,4,5,6,7,8,9,10)
            end_lessons, // tiết kết thúc (1,2,3,4,5,6,7,8,9,10)
            total_slots, // số lượng sinh viên có thể đk lớp này
            day_of_week, // ngày trong tuần
            // start_day,   // ngày bắt đầu học
            // end_day,     // ngày kết thúc học
            count_week,  // tổng số tuần học
            semester     // học kì
        } = data;

        const semesterData = await db.Semester.findByPk(semester);

        if (!semesterData) {
            return { EC: 1, EM: 'Invalid semester' };
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
                [Op.or]: [
                    {
                        start_lessons: {
                            [Op.between]: [start_lessons, end_lessons] // tiết bắt đầu của lớp cũ nằm giữa khung giờ dạy mới
                        }
                    },
                    {
                        end_lessons: {
                            [Op.between]: [start_lessons, end_lessons] // tiết kết thúc của lớp cũ nằm giữa khung giờ dạy mới 
                        }
                    },
                    {
                        [Op.and]: [
                            { start_lessons: { [Op.lte]: start_lessons } },
                            { end_lessons: { [Op.gte]: end_lessons } }
                        ] // khung giờ học lớp mới bao trùm khung giờ học lớp cũ
                    }
                ]
            }
        });

        if (conflictTeacher) {
            return {
                EC: 3,
                EM: 'The teacher is already assigned to another class during this time.'
            };
        }

        // Kiểm tra phòng học có bị trùng giờ
        let conflictRoom = await db.Class.findOne({
            where: {
                id_room,
                day_of_week,
                id_semester: semester,
                [Op.or]: [
                    {
                        start_lessons: {
                            [Op.between]: [start_lessons, end_lessons]
                        }
                    },
                    {
                        end_lessons: {
                            [Op.between]: [start_lessons, end_lessons]
                        }
                    },
                    {
                        [Op.and]: [
                            { start_lessons: { [Op.lte]: start_lessons } },
                            { end_lessons: { [Op.gte]: end_lessons } }
                        ]
                    }
                ]
            }
        });

        if (conflictRoom) {
            return {
                EC: 4,
                EM: 'The room is already booked during the selected time slot.'
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
            EM: 'Ok'
        };
    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
};


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

        const allClasses = await db.Class.findAll({ where: { id_semester: semesterId } });

        const schedule = [];

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(weekStartDate); // Ngày bắt đầu của tuần (Mon)
            currentDate.setDate(weekStartDate.getDate() + i);

            const dayCode = getDayCode(currentDate.getDay()); // 'Sun', 'Mon', 'Tue', ...
            
            const dayClasses = allClasses.filter(cls => {
                if (cls.day_of_week !== dayCode) return false; // Lớp không thuộc ngày currentDate

                // Xác định ngày bắt đầu thực tế của lớp học
                const classStartDayOffset = (getDayIndex(cls.day_of_week) + 7 - semesterStart.getDay()) % 7;

                const classStartDate = new Date(semesterStart);
                classStartDate.setDate(semesterStart.getDate() + classStartDayOffset);

                const classEndDate = new Date(classStartDate);
                classEndDate.setDate(classStartDate.getDate() + (cls.count_week - 1) * 7);

                return currentDate >= classStartDate && currentDate <= classEndDate;
                // Trả ra lớp có ngày bắt đầu và ngày kết thúc chứa ngày currentDate
            });

            schedule.push({
                day_of_week: dayCode,
                // date: currentDate.toISOString().split('T')[0],
                date: currentDate,
                classes: dayClasses
            });
        }

        return {
            Ec: 0,
            EM: 'Ok',
            DT: schedule
        };
    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
}



module.exports = {
    createClass, getWeeklySchedule
}