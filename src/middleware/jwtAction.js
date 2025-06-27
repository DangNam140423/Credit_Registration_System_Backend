require('dotenv').config();
import db from '../models/index';
import jwt from "jsonwebtoken";

const nonSecurePath = [
    '/', '/api/login', '/api/register', '/api/logout',
    '/api/verify-user',
    '/api/get-all-semester',
    '/api/get-all-department',
    '/api/get-all-class',
    '/api/get-all-class-registered',
];
// các path này sẽ không cần check user đã đăng nhập hay chưa

const createJWT = (payload) => {
    let key = process.env.JWT_SECRET;
    let token = null
    try {
        token = jwt.sign(
            payload,
            key,
            {
                expiresIn: process.env.JWT_EXPIRES_IN,
                // (Mặc định trong gói jsonwebtoken nên không cần setup)
                // header: {
                //     alg: 'RS256', // Chọn thuật toán RSA SHA256 
                //     typ: 'JWT'
                // }
            }
        );
    } catch (error) {
        console.log(error)
    }

    return token;
}

const verifyToken = (token) => {
    let key = process.env.JWT_SECRET;
    let decoded = null;
    try {
        decoded = jwt.verify(token, key);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.log('Token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            console.log("Invalid signature");
        } else {
            console.log(error);
        }
    }
    return decoded;
}

const extractToken = (req) => {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    }
    return null;
}

const checkMiddelwareUserJWT = async (req, res, next) => {
    try {
        if (nonSecurePath.includes(req.path)) {
            return next();
        }

        let cookies = req.cookies;
        let tokenFromHeader = extractToken(req);
        if (
            (cookies && cookies.jwt) ||
            tokenFromHeader
        ) {
            let token = cookies && cookies.jwt ? cookies.jwt : tokenFromHeader;
            let decoded = verifyToken(token);
            if (decoded) {
                let userToImage = await db.User.findOne({
                    where: { email: decoded.email },
                    attributes: ['avatar'],
                    raw: true
                });
                // lấy ảnh avatar của user
                decoded.avatar = userToImage.avatar;
                req.user = decoded;
                req.token = token;
                next();
            } else {
                return res.status(401).json({
                    EC: -1,
                    DT: '',
                    EM: 'Not authnticated the user'
                })
            }
        } else {
            console.error("nguuuu");
            return res.status(401).json({
                EC: -1,
                DT: '',
                EM: 'Not authnticated the user'
            })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            EC: -1,
            DT: '',
            EM: 'Error from server'
        })
    }
}

const checkUserPermissonJWT = (req, res, next) => {
    if (nonSecurePath.includes(req.path) || req.path === '/api/account') {
        return next();
    }

    // req.user from checkMiddelwareUserJWT
    if (req.user) {
        let role = req.user.role;
        let path = [];
        if (!role) {
            return res.status(403).json({
                EC: -1,
                DT: '',
                EM: `You don't permission to access this resource ...`
            })
        }
        switch (role) {
            case 'R0': // Admin
                path = [
                    '/api/get-all-user', '/api/create-new-user', '/api/delete-user', '/api/edit-user',
                    '/api/get-all-module', '/api/create-module', '/api/edit-module', '/api/delete-module',
                    '/api/get-room-empty', '/api/get-teacher-free',
                    '/api/get-all-class', '/api/create-new-class', '/api/edit-class', '/api/delete-class',
                    '/api/open-semester',
                    '/api/get-schedule-over',
                ];
                break;
            case 'R1': // Train Department
                path = [
                    '/api/get-all-user',
                    '/api/get-room-empty', '/api/get-teacher-free',
                    '/api/get-all-class', '/api/create-new-class', '/api/edit-class', '/api/delete-class',
                    '/api/get-schedule-over',
                    '/api/open-semester',
                    '/api/get-all-module', '/api/create-module', '/api/edit-module', '/api/delete-module'
                ];
                break;
            case 'R2': // Teacher
                path = [
                    '/api/get-schedule-teach'
                ];
                break;
            case 'R3': // Student
                path = [
                    '/api/credit-registration', '/api/cancel-class',
                    '/api/get-schedule-study',
                    '/api/get-tuition'
                ];
                break;
            default:
                break;
        }


        if (path.includes(req.path)) {
            next();
        } else {
            return res.status(403).json({
                EC: -1,
                DT: '',
                EM: `You don't permission to access this resource ...`
            })
        }
    } else {
        return res.status(401).json({
            EC: -1,
            DT: '',
            EM: 'Not authnticated the user'
        })
    }
}

module.exports = {
    createJWT, checkMiddelwareUserJWT, checkUserPermissonJWT
}