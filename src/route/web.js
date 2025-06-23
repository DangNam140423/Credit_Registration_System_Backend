import express from "express";
import userController from '../controllers/userController';
import accountController from '../controllers/accountController';
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

    router.get('/api/get-all-user', userController.handleGetAllUser);
    router.post('/api/create-new-user', uploadClodinary.single('avatar'), userController.handleCreateNewUser);
    router.put('/api/edit-user', uploadClodinary.single('avatar'), userController.handelEditUser);
    router.delete('/api/delete-user', userController.handelDeleteUser);

    return app.use('/', router);
}


export default initWebRoute;
