import semesterServices from '../serviecs/semesterServices';

let getAllSemester = async (req, res) => {
    try {
        let result = await semesterServices.getAllSemester();
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
    getAllSemester
}
