import userServices from '../serviecs/userServices';
const cloudinary = require('cloudinary').v2;

let handleHome = async (req, res) => {

    // let users = await db.User.findAll({
    //     attributes: {
    //         exclude: ['password']
    //     },
    //     order: [
    //         ['id', 'DESC'],
    //     ]
    // })
    return res.render('index.ejs'
        // , { dataUser: users }
    )
}


let handleGetAllUser = async (req, res) => {
    try {
        let id = req.query.id;
        let page = req.query.page;
        let limit = req.query.limit;
        let role = req.query.role;
        if (id && page && limit &&
            typeof id !== 'undefined' && typeof page !== 'undefined' && typeof limit !== 'undefined'
        ) {
            let result = await userServices.getAllUsers(id, +page, +limit, role);
            return res.status(200).json(result);
        } else {
            return res.status(200).json({
                EC: 1,
                EM: 'Missing inputs parameter !',
                DT: []
            })
        }
    } catch (error) {
        console.error(error);
        return res.status(200).json({
            EC: -1,
            EM: "Error form the server"
        });
    }

}


let handleCreateNewUser = async (req, res) => {
    try {
        let dataUser = req.body;
        dataUser.avatar = await (req.file && req.file.path) ? req.file.path : null;

        let data = await userServices.createNewUser(dataUser);
        if (req.file && req.file.filename && data.EC !== 0) {
            cloudinary.uploader.destroy(req.file.filename);
        }
        return res.status(200).json(
            data
        )
    } catch (error) {
        if (req.file && req.file.filename) {
            cloudinary.uploader.destroy(req.file.filename);
        }
        console.error(error);
        return res.status(200).json({
            EC: -1,
            EM: "Error form the server"
        });
    }
}

let handleEditUser = async (req, res) => {
    try {
        let user = req.body;
        user.avatar = req?.file?.path || null;

        let data = await userServices.editUser(user);

        if (req.file && req.file.filename) {
            if (data.EC === 0) {
                // Có avatar mới đồng thời đã sửa thông tin thành công
                // Lúc này cần xóa avatar cũ trong cloud
                // let fileNameOld =?;
                cloudinary.uploader.destroy(filenameOld);
            } else {
                // Nếu sửa tt không thành công
                // Xóa avatar vừa mới gửi lên
                cloudinary.uploader.destroy(req.file.filename);
            }
        }

        return res.status(200).json(
            data
        )
    } catch (error) {
        if (req.file && req.file.filename) {
            cloudinary.uploader.destroy(req.file.filename);
        }
        console.error(error);
        return res.status(200).json({
            EC: -1,
            EM: "Error form the server"
        });
    }
}

let handleDeleteUser = async (req, res) => {
    try {
        const { id, filenameOld } = req.body;

        const message = await userServices.deleteUser(id);

        if (message.EC === 0 && filenameOld) {
            await cloudinary.uploader.destroy(filenameOld);
        }

        return res.status(200).json(message);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            EC: -1,
            EM: 'Error from the server',
        });
    }
}


module.exports = {
    handleHome,
    handleGetAllUser, handleCreateNewUser, handleEditUser, handleDeleteUser
}