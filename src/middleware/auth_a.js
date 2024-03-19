const jwt = require("jsonwebtoken");
const { Register, Doctor, Patient, App, Schedule,Admin } = require("../models/model"); 

const auth_a = async (req, res, next) => {
    try {

        const token = req.cookies.jwta;
        const verifyUser = jwt.verify(token, "ournamesaresumitchakrabortyandbhaskarjyotikumar");
        //console.log(verifyUser);

        const user = await Admin.findOne({ _id: verifyUser._id })
        //console.log(user);

        req.token = token;
        req.user = user;

        next();

    } catch (e) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/a-login",
        });
    }
}

module.exports = auth_a;