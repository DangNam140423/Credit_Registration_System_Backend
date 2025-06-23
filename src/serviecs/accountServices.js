require('dotenv').config();
import db from '../models/index';
import bcrypt from 'bcryptjs';
import { createJWT } from '../middleware/jwtAction';
const salt = bcrypt.genSaltSync(10);

let hanleUserLogin = async (email, password) => {
    try {
        const user = await db.User.findOne({
            where: { email },
            attributes: ['id', 'email', 'role', 'password', 'name', 'status', 'avatar'],
            raw: true
        });

        if (!user) {
            return {
                EC: 1,
                EM: `Incorrect email or password.`,
            };
        }

        if (!user.status) {
            return {
                EC: 4,
                EM: 'Account has not been activated',
            };
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return {
                EC: 1,
                EM: 'Incorrect email or password.',
            };
        }

        delete user.password;

        const jwtData = await createJWT({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
        });

        return {
            EC: 0,
            EM: 'OKK',
            user,
            jwtData,
        };
    } catch (error) {
        console.error(error);
        throw new Error(error.mesage);
    }
}


module.exports = {
    hanleUserLogin
}

