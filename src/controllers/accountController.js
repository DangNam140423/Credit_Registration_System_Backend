import accountServices from '../serviecs/accountServices';


let getUserAccount = async (req, res) => {
    return res.status(200).json({
        EC: 0,
        EM: 'Okk',
        DT_1: req.user,
        DT_2: req.token
        // req.user and req.token from (checkMiddelwareUserJWT) in jwtAction.js
    })
}

let handleLogin = async (req, res) => {
    try {
        let email = req.body.email;
        let password = req.body.password;
        if (!email || !password) {
            return res.status(200).json({
                EC: 1,
                EM: 'Missing inputs parameter !',
                DT: ''
            })
        }

        let userData = await accountServices.hanleUserLogin(email, password);
        // check email exit in database
        // compare password
        // return infoUser
        // access_token: JWT json web token
        // set cookie
        res.cookie(
            "jwt", userData.jwtData,
            {
                httpOnly: true,
                sameSite: "None",
                secure: true
            }
            // httpOnly: true để phía react (javascript) không thể đọc
            // và thay đổi giá trị của cookie đó, 
            // giảm thiểu rủi ro bị tấn công Cross - Site Scripting(XSS)
        );
        return res.status(200).json({
            EC: userData.EC,
            EM: userData.EM,
            DT_1: userData?.user || {},
            DT_2: userData?.jwtData || {}
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            EC: -1,
            EM: "Error form the server"
        });
    }
}

let handleLogout = (req, res) => {
    try {
        res.clearCookie("jwt");
        return res.status(200).json({
            EC: 0,
            EM: 'Clear cookie done!'
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            EC: -1,
            EM: "Error form the server"
        });
    }
}


module.exports = {
    getUserAccount, handleLogin, handleLogout
}