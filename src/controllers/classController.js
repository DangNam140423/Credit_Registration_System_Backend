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

let getWeeklySchedule = async (req, res) => {
    try {
        let result = await classServices.getWeeklySchedule(req.body);
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
    handleCreateClass, getWeeklySchedule
}

