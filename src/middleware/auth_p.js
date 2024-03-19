const jwt = require("jsonwebtoken");
const { Register, Doctor, Patient, App, Schedule,Admin } = require("../models/model");

const auth = async (req, res, next) =>{
    try {
        
        const token = req.cookies.jwtp;
        const verifyUser = jwt.verify(token, "ournamesaresumitchakrabortyandbhaskarjyotikumar");

        const user = await Register.findOne({_id:verifyUser._id})

        req.token = token;
        req.user = user;

        next();

    } catch (e) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/login",
        });
    }
}

module.exports = auth;