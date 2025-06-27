import studyServices from '../serviecs/studyServices';

let handleCreateStudy = async (req, res) => {
    try {
        let result = await studyServices.createStudy(req.body);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            EC: -1,
            EM: "Error form the server"
        });
    }
}


let handleGetStudy = async (req, res) => {
    try {
        let result = await studyServices.getStudy(req.query);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            EC: -1,
            EM: "Error form the server"
        });
    }
}

let handleCancelStudy = async (req, res) => {
    try {
        let result = await studyServices.cancelStudy(req.body);
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
    handleCreateStudy, handleGetStudy, handleCancelStudy
}

