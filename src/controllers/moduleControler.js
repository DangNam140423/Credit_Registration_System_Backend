import moduleServices from '../serviecs/moduleServices';

let getAllModule = async (req, res) => {
    try {
        let result = await moduleServices.getAllModule();
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            EC: -1,
            EM: "Error form the server"
        });
    }
}


let handleCreateModule = async (req, res) => {
    try {
        let result = await moduleServices.createModule(req.body);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            EC: -1,
            EM: "Error form the server"
        });
    }
}


let handleDeleteModule = async (req, res) => {
    try {
        let result = await moduleServices.deleteModule(req.body);
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
    getAllModule, handleCreateModule, handleDeleteModule
}
