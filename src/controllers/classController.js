import classServices from '../serviecs/classServices';

let handleCreateClass = async (req, res) => {
    try {
        let result = await classServices.createClass(req.body);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            EC: -1,
            EM: "Error form the server"
        });
    }
}



let handleDeleteClass = async (req, res) => {
    try {
        let result = await classServices.deleteClass(req.body);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            EC: -1,
            EM: "Error form the server"
        });
    }
}

let getWeeklySchedule = async (req, res) => {
    try {
        let result = await classServices.getWeeklySchedule(req.query);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            EC: -1,
            EM: "Error form the server"
        });
    }
}


let getRoomEmpty = async (req, res) => {
    try {
        let result = await classServices.getRoomEmpty(req.body);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            EC: -1,
            EM: "Error form the server"
        });
    }
}


let getTeacherFree = async (req, res) => {
    try {
        let result = await classServices.getTeacherFree(req.body);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            EC: -1,
            EM: "Error form the server"
        });
    }
}


let openSemester = async (req, res) => {
    try {
        let result = await classServices.openSemester(req.body);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            EC: -1,
            EM: "Error form the server"
        });
    }
}

let getAllClass = async (req, res) => {
    try {
        let result = await classServices.getAllClass(req.query);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            EC: -1,
            EM: "Error form the server"
        });
    }
}

module.exports = {
    handleCreateClass, handleDeleteClass, getWeeklySchedule, getRoomEmpty, getTeacherFree,
    openSemester,
    getAllClass
}

