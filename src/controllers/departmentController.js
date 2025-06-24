import departmentServices from '../serviecs/departmentServices';

let getAllDepartment = async (req, res) => {
    try {
        let result = await departmentServices.getAllDepartment();
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
    getAllDepartment
}
