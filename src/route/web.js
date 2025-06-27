import express from "express";
import userController from '../controllers/userController';
import accountController from '../controllers/accountController';
import moduleController from '../controllers/moduleControler.js';
import departmentController from '../controllers/departmentController.js';
import semesterController from '../controllers/semesterController.js';
import classController from '../controllers/classController.js';
import studyController from '../controllers/studyController.js';
import uploadClodinary from '../middleware/uploadCloudinary.js'
import { checkMiddelwareUserJWT, checkUserPermissonJWT } from '../middleware/jwtAction.js'

let router = express.Router();

const initWebRoute = (app) => {
    router.get('/', userController.handleHome);



    //                            API SYSTEM ADIM
    router.all('*', checkMiddelwareUserJWT, checkUserPermissonJWT)
    router.post('/api/login', accountController.handleLogin);
    router.post('/api/logout', accountController.handleLogout);
    router.get('/api/account', accountController.getUserAccount);

    router.get('/api/get-all-semester', semesterController.getAllSemester);

    router.get('/api/get-all-department', departmentController.getAllDepartment);

    router.get('/api/get-all-user', userController.handleGetAllUser);
    router.post('/api/create-new-user', uploadClodinary.single('avatar'), userController.handleCreateNewUser);
    router.put('/api/edit-user', uploadClodinary.single('avatar'), userController.handleEditUser);
    router.delete('/api/delete-user', userController.handleDeleteUser);

    router.get('/api/get-all-module', moduleController.getAllModule);
    router.post('/api/create-module', moduleController.handleCreateModule);
    router.delete('/api/delete-module', moduleController.handleDeleteModule);

    router.get('/api/get-schedule-over', classController.getWeeklySchedule);
    router.post('/api/create-new-class', classController.handleCreateClass);
    router.delete('/api/delete-class', classController.handleDeleteClass);
    router.post('/api/get-room-empty', classController.getRoomEmpty);
    router.post('/api/get-teacher-free', classController.getTeacherFree);

    router.post('/api/open-semester', classController.openSemester);

    router.get('/api/get-all-class', classController.getAllClass);
    router.post('/api/credit-registration', studyController.handleCreateStudy);
    router.get('/api/get-all-class-registered', studyController.handleGetStudy);
    router.delete('/api/cancel-class', studyController.handleCancelStudy);


    return app.use('/', router);
}


export default initWebRoute;
