const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const cookieParser = require("cookie-parser");
const auth_p = require("./middleware/auth_p");
const auth_a = require("./middleware/auth_a");
const auth_d = require("./middleware/auth_d");
const nodemailer = require("nodemailer");
const validator = require("validator");


var mongoose = require('mongoose');
// var objectId = mongoose.Types.ObjectId('569ed8269353e9f4c51617aa');
require("./db/conn");
const { Register, Doctor, Patient, App, Schedule, Admin, Applicant, Invoice, Autodoc, Autopat, Autoapp, Autosch } = require("./models/model");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')))

const port = process.env.PORT || 3000;  //used to provide a port no. to the host

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");    //used because view folder is inside templates
const partials_path = path.join(__dirname, "../templates/partials");    //used because partials folder is inside templates



app.use(express.static(static_path));     //host the static website
app.set("view engine", "hbs");
app.set("views", template_path);      //telling he server to go to the templates folder 
hbs.registerPartials(partials_path);     ///registering the partial folder

app.get("/", async (req, res) => {

    const today = (function () {
        const now = new Date();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        return `${now.getFullYear()}-${month}-${day}`;
    });
    let currDate = today();                                  //generating current date
    // console.log(currDate);

    const displayapp = await Register.find({}, { Daate: 1, _id: 0 });
    // console.log(displayapp.Daate[1]);

    for (let i = 0; i < displayapp.length; i++) {

        const regDate = displayapp[i].Daate;
        // console.log(regDate);

        const date = new Date(regDate);

        function addOneYear(date) {
            date.setFullYear(date.getFullYear() + 1);
            return date;
        }

        const newDate = addOneYear(date);
        const checkDate = newDate.toISOString().slice(0, 10);
        // console.log(checkDate);

        if (checkDate === currDate) {
            const Editdate = await Register.deleteMany({ Daate: regDate });
            // console.log("Data deleted");
        }

    }

    res.redirect("intro")

});

app.get("/login", (req, res) => {
    res.render("login")
});

app.get("/a-login", (req, res) => {
    res.render("a-login")
});

app.get("/d-login", (req, res) => {
    res.render("d-login")
});

app.get("/index", (req, res) => {
    const today = (function () {
        const now = new Date();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        return `${now.getFullYear()}-${month}-${day}`;
    });

    // console.log(today);
    // console.log("hello");

    res.render("index", {
        regToday: today       //displaying details
    });
});

//for invoice
app.get("/invoice", auth_a, (req, res) => {
    const today = (function () {
        const now = new Date();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        return `${now.getFullYear()}-${month}-${day}`;
    });

    // console.log(today);
    // console.log("hello");

    res.render("invoice", {
        regToday: today       //displaying details
    });
});

//for admin
app.get("/home_a", auth_a, async (req, res) => {
    function today() {
        const now = new Date();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        return `${now.getFullYear()}-${month}-${day}`;
    };
    let datef = today();
    // console.log(datef);

    const displayapp = await App.find({});
    let apptotal = displayapp.length;
    // console.log(apptotal);

    const currdate = await App.find({ date: datef });
    let currtotal = currdate.length;
    // console.log(currtotal);

    const displaypat = await Patient.find({});
    let pattotal = displaypat.length;
    // console.log(pattotal);

    const cardio = await App.find({ $and: [{ date: datef }, { specialisation: "Cardiologist" }] });
    let cardiototal = cardio.length;
    // console.log(cardiototal);

    const neuro = await App.find({ $and: [{ date: datef }, { specialisation: "Neurologist" }] });
    let neurototal = neuro.length;
    // console.log(neurototal);

    const pedia = await App.find({ $and: [{ date: datef }, { specialisation: "Pediatrician" }] });
    let pediatotal = pedia.length;
    // console.log(pediatotal);

    const gyne = await App.find({ $and: [{ date: datef }, { specialisation: "Gynecologist" }] });
    let gynetotal = gyne.length;
    // console.log(gynetotal);

    const sych = await App.find({ $and: [{ date: datef }, { specialisation: "Psychiatrist" }] });
    let sychtotal = sych.length;
    // console.log(sychtotal);

    const apl = await Applicant.find({ status: "" });
    let apltotal = apl.length;
    // console.log(apltotal);

    res.render("home_a", {
        regToday: { app: apptotal, curr: currtotal, pat: pattotal, car: cardiototal, nue: neurototal, ped: pediatotal, gyn: gynetotal, syc: sychtotal, apli: apltotal }       //displaying details
    });
});

//logout for admin
app.get("/logout", auth_a, async (req, res) => {
    try {

        req.user.tokens = req.user.tokens.filter((currElement) => {
            return currElement.token != req.token
        })

        res.clearCookie("jwta");                   //destroying or removing the cookie
        //console.log("logout successfully");

        await req.user.save();
        res.render("intro");

    } catch (error) {
        res.status(500).send(error);
    }
});

//for patient
app.get("/home_p", auth_p, async (req, res) => {
    function today() {
        const now = new Date();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        return `${now.getFullYear()}-${month}-${day}`;
    };
    let datef = today();
    // console.log(datef);

    const displayapp = await App.find({});
    let apptotal = displayapp.length;
    // console.log(apptotal);

    const currdate = await App.find({ date: datef });
    let currtotal = currdate.length;
    // console.log(currtotal);

    const displaypat = await Patient.find({});
    let pattotal = displaypat.length;
    // console.log(pattotal);

    const cardio = await App.find({ $and: [{ date: datef }, { specialisation: "Cardiologist" }] });
    let cardiototal = cardio.length;
    // console.log(cardiototal);

    const neuro = await App.find({ $and: [{ date: datef }, { specialisation: "Neurologist" }] });
    let neurototal = neuro.length;
    // console.log(neurototal);

    const pedia = await App.find({ $and: [{ date: datef }, { specialisation: "Pediatrician" }] });
    let pediatotal = pedia.length;
    // console.log(pediatotal);

    const gyne = await App.find({ $and: [{ date: datef }, { specialisation: "Gynecologist" }] });
    let gynetotal = gyne.length;
    // console.log(gynetotal);

    const sych = await App.find({ $and: [{ date: datef }, { specialisation: "Psychiatrist" }] });
    let sychtotal = sych.length;
    // console.log(sychtotal);

    res.render("home_p", {
        regToday: { app: apptotal, curr: currtotal, pat: pattotal, car: cardiototal, nue: neurototal, ped: pediatotal, gyn: gynetotal, syc: sychtotal }       //displaying details
    });
});

//logout for patient
app.get("/logout_p", auth_p, async (req, res) => {
    try {

        req.user.tokens = req.user.tokens.filter((currElement) => {
            return currElement.token != req.token
        })

        res.clearCookie("jwtp");                   //destroying or removing the cookie
        // console.log("logout successfully");

        await req.user.save();
        res.render("intro");
    } catch (error) {
        res.status(500).send(error);
    }
});

//for doctor
app.get("/home_d", auth_d, async (req, res) => {
    function today() {
        const now = new Date();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        return `${now.getFullYear()}-${month}-${day}`;
    };
    let datef = today();
    // console.log(datef);

    const displayapp = await App.find({});
    let apptotal = displayapp.length;
    // console.log(apptotal);

    const currdate = await App.find({ date: datef });
    let currtotal = currdate.length;
    // console.log(currtotal);

    const displaypat = await Patient.find({});
    let pattotal = displaypat.length;
    // console.log(pattotal);

    const cardio = await App.find({ $and: [{ date: datef }, { specialisation: "Cardiologist" }] });
    let cardiototal = cardio.length;
    // console.log(cardiototal);

    const neuro = await App.find({ $and: [{ date: datef }, { specialisation: "Neurologist" }] });
    let neurototal = neuro.length;
    // console.log(neurototal);

    const pedia = await App.find({ $and: [{ date: datef }, { specialisation: "Pediatrician" }] });
    let pediatotal = pedia.length;
    // console.log(pediatotal);

    const gyne = await App.find({ $and: [{ date: datef }, { specialisation: "Gynecologist" }] });
    let gynetotal = gyne.length;
    // console.log(gynetotal);

    const sych = await App.find({ $and: [{ date: datef }, { specialisation: "Psychiatrist" }] });
    let sychtotal = sych.length;
    // console.log(sychtotal);

    const apl = await Applicant.find({ status: "" });
    let apltotal = apl.length;
    // console.log(apltotal);

    res.render("home_d", {
        regToday: { app: apptotal, curr: currtotal, pat: pattotal, car: cardiototal, nue: neurototal, ped: pediatotal, gyn: gynetotal, syc: sychtotal, apli: apltotal }       //displaying details
    });
});

//logout for doctor
app.get("/logout_d", auth_d, async (req, res) => {
    try {

        req.user.tokens = req.user.tokens.filter((currElement) => {
            return currElement.token != req.token
        })

        res.clearCookie("jwtd");                   //destroying or removing the cookie
        // console.log("logout successfully");

        await req.user.save();
        res.render("intro");
    } catch (error) {
        res.status(500).send(error);
    }
});

//for admin
app.get("/addpa", auth_a, (req, res) => {
    res.render("addpa")
});

//for patient
app.get("/addpatient_p", auth_p, (req, res) => {
    res.render("addpatient_p")
});

//for admin
app.get("/addsch", auth_a, async (req, res) => {
    const displayapp = await Doctor.find({ status: "Active" }, { docname: 1, _id: 0 });
    res.render("addsch", {
        Docname: displayapp
    });
    // console.log(displayapp);
});

//for admin
app.get("/bookapp", auth_a, async (req, res) => {
    res.render("bookapp")
});

//for patient
app.get("/bookappointment_p", auth_p, async (req, res) => {
    res.render("bookappointment_p")
});

// for admin
app.get("/createdoc", auth_a, (req, res) => {
    res.render("createdoc")
});

app.get("/intro", (req, res) => {
    res.render("intro")
});

//pament for admin
app.get("/payment", auth_a, (req, res) => {
    res.render("payment")
});

//Cancel appointment of patient(Admin)
app.get("/cancel_app", auth_a, (req, res) => {
    res.render("cancel_app")
});

//Cancel appointment of patient
app.get("/cancelp_app", auth_p, (req, res) => {
    res.render("cancelp_app")
});

//applicant of doctor
app.get("/applicant", (req, res) => {
    res.render("applicant")
});

//check for patient
app.get("/check_p", auth_p, async (req, res) => {
    const displayapp = await Doctor.find({ status: "Active" }, { docname: 1, _id: 0 });
    res.render("check_p", {
        Docname: displayapp
    });
    // console.log(displayapp);
});

//check for admin
app.get("/check_a", auth_a, async (req, res) => {
    const displayapp = await Doctor.find({ status: "Active" }, { docname: 1, _id: 0 });
    res.render("check_a", {
        Docname: displayapp
    });
    // console.log(displayapp);
});

//doctor list for admin
app.get("/doclist", auth_a, async (req, res) => {

    const displayDoc = await Doctor.find({});
    res.render("doclist", {
        regDoc: displayDoc        //displaying details
    });
});

//patient list for admin
app.get("/patlist", auth_a, async (req, res) => {
    const displayPat = await Patient.find({});
    res.render("patlist", {
        patlist: displayPat
    });
});

//schedule list for admin
app.get("/schlist", auth_a, async (req, res) => {
    const displaysch = await Schedule.find({});
    res.render("schlist", {
        schlist: displaysch
    });
});

//schedule list for doctor
app.get("/schedulelist_d", auth_d, async (req, res) => {
    const displaysch = await Schedule.find({});
    res.render("schedulelist_d", {
        schlist: displaysch
    });
});

//appointment list for admin
app.get("/applist", auth_a, async (req, res) => {
    const displayapp = await App.find({});
    res.render("applist", {
        applist: displayapp
    });
});

//appointment list for doctor
app.get("/appointmentlist_d", auth_d, async (req, res) => {
    const displayapp = await App.find({});
    res.render("appointmentlist_d", {
        applist: displayapp
    });
});

//edit list of doctor for admin
app.get("/docEdit/:id", auth_a, async (req, res) => {

    try {
        const Id = req.params.id;
        const Editdoc = await Doctor.findOne({ _id: Id });
        // console.log(Editdoc);
        // console.log(Editdoc.docId);

        res.render("editDoc", {
            docid: Editdoc.docId,
            docname: Editdoc.docname,
            dob: Editdoc.dob,
            qualification: Editdoc.qualification,
            specialisation: Editdoc.specialisation,
            gender: Editdoc.gender,
            pno: Editdoc.pno,
            password: Editdoc.password
        });

    } catch (error) {
        res.status(400).send(error);
    }
});

//edit list of doctor for admin
app.post("/editDoc", auth_a, async (req, res) => {

    try {
        const Did = req.body.id;
        const Docname = req.body.doc;
        const Dob = req.body.dateb;
        const Qualification = req.body.qua;
        const Specialisation = req.body.spec;
        const Gender = req.body.gen;
        const Pno = req.body.num;
        const Password = req.body.pass;

        const updateDoc = await Doctor.updateOne({ docId: Did }, { $set: { docname: Docname, dob: Dob, qualification: Qualification, specialisation: Specialisation, gender: Gender, pno: Pno, password: Password } });
        // console.log(updateDoc.docname);
        // console.log(updateDoc);

        res.redirect("/doclist");

    } catch (error) {
        res.status(400).send(error);
    }
});

//edit list of appointment for admin
app.get("/appEdit/:id", auth_a, async (req, res) => {

    try {
        const Id = req.params.id;
        const Editapp = await App.findOne({ _id: Id });
        // console.log(Editapp);

        res.render("editApp", {
            pname: Editapp.pname,
            dname: Editapp.dname,
            date: Editapp.date,
            time: Editapp.time,
            pno: Editapp.pno,
            email: Editapp.email,
            com: Editapp.com
        });

    } catch (error) {
        res.status(400).send(error);
    }
});

//edit list of appointment for admin
app.post("/editApp", auth_a, async (req, res) => {

    try {

        const Pname = req.body.p_name;
        const Dname = req.body.name;
        const Date = req.body.date;
        const Time = req.body.time;
        const Pno = req.body.num;
        const Email = req.body.email;
        const Com = req.body.note

        const updateApp = await App.updateOne({ email: Email }, { $set: { pname: Pname, dname: Dname, date: Date, time: Time, pno: Pno, com: Com } });
        // console.log(updateApp);

        res.redirect("/applist");

    } catch (error) {
        res.status(400).send(error);
    }
});

//edit list of patient for admin
app.get("/patEdit/:id", auth_a, async (req, res) => {

    try {
        const Id = req.params.id;
        const Editpat = await Patient.findOne({ _id: Id });
        // console.log(Editpat);

        res.render("editPat", {
            pname: Editpat.pname,
            pdob: Editpat.pdob,
            address: Editpat.address,
            gender: Editpat.gender,
            pno: Editpat.pno
        });

    } catch (error) {
        res.status(400).send(error);
    }
});

//edit list of patient for admin
app.post("/editPat", auth_a, async (req, res) => {

    try {

        const Pname = req.body.pat;
        const Pdob = req.body.dateb;
        const Address = req.body.add;
        const Gender = req.body.gen;
        const Pno = req.body.num;

        const updatePat = await Patient.updateOne({ pno: Pno }, { $set: { pname: Pname, pdob: Pdob, address: Address, gender: Gender } });
        // console.log(updatePat);

        res.redirect("/patlist");

    } catch (error) {
        res.status(400).send(error);
    }

});

//edit list of leave for admin
app.get("/schEdit/:id", auth_a, async (req, res) => {

    try {
        const Id = req.params.id;
        const Editsch = await Schedule.findOne({ _id: Id });
        console.log(Editsch);

        res.render("editSch", {
            sdoc: Editsch.sdoc,
            sdate: Editsch.sdate,
            edate: Editsch.edate,
            spec: Editsch.spec,
            status: Editsch.status
        });

    } catch (error) {
        res.status(400).send(error);
    }
});

//edit list of leave for admin
app.post("/editSch", auth_a, async (req, res) => {

    try {
        const Sdoc = req.body.sname;
        // console.log(Sdoc);
        const Sdate = req.body.sdate;
        const Edate = req.body.edate;
        const Spec = req.body.spec;
        const Status = req.body.status;

        const updateSch = await Schedule.updateOne({ sdoc: Sdoc }, { $set: { sdate: Sdate, edate: Edate, spec: Spec, status: Status } });
        console.log(updateSch.sdate);

        res.redirect("/schlist");

    } catch (error) {
        res.status(400).send(error);
    }

});

//delete list of leave for admin
app.get("/schDelete/:id", auth_a, async (req, res) => {

    try {
        const Id = req.params.id;
        const Deletesch = await Schedule.deleteOne({ _id: Id });
        // console.log(Deletesch);

        res.redirect("/schlist");

    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/a-login",
        });
    }
});

//delete list of patient for admin
app.get("/patDelete/:id", auth_a, async (req, res) => {

    try {
        const Id = req.params.id;
        const Deletepat = await Patient.deleteOne({ _id: Id });
        // console.log(Deletepat);

        res.redirect("/patlist");

    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/a-login",
        });
    }
});

//delete list of doctor for admin
app.get("/docDelete/:id", auth_a, async (req, res) => {

    try {
        const Id = req.params.id;
        const Deletedoc = await Doctor.deleteOne({ _id: Id });
        // console.log(Deletedoc);

        res.redirect("/doclist");

    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/a-login",
        });
    }
});

//delete list of appointment for admin
app.get("/appDelete/:id", auth_a, async (req, res) => {

    try {
        const Id = req.params.id;
        const Deleteapp = await App.deleteOne({ _id: Id });
        // console.log(Deleteapp);

        res.redirect("/applist");

    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/a-login",
        });
    }
});

//registration for patient
app.post("/index", async (req, res) => {
    try {

        const name = req.body.fname;
        const email = req.body.email;
        const mobile = req.body.num;
        const password = req.body.pass;

        if (!validator.isMobilePhone(mobile, 'en-IN') || !validator.isEmail(email) || !validator.isStrongPassword(password)) {

            res.status(400).render("sorry", {
                message: "Invalid Details",
                hreflink: "/index",
            });

        } else {

            const userEmail = await Register.find({ Email: email });
            // console.log(userEmail);

            for (let i = 0; i < userEmail.length; i++) {
                if (userEmail[i].Email === email) {
                    res.send("Data already registered");
                }
            }

            if (userEmail.length === 0) {
                const registerEmployee = new Register({
                    FirstName: req.body.fname,
                    LastName: req.body.Nname,
                    pno: req.body.num,
                    Age: req.body.age,
                    Email: req.body.email,
                    Daate: req.body.inv,
                    Gender: req.body.gen,
                    Role: req.body.rol,
                    Password: req.body.pass
                })

                // console.log("hello");
                const registered = await registerEmployee.save();
                res.status(201).render("login");                     //redirecting it to the next page

            }

        }

    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/index",
        });
    }
})

//patient login check
app.post("/login", async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.pass;

        const userEmail = await Register.findOne({ Email: email });
        // console.log(userEmail);

        const token = await userEmail.generateAuthToken();    //generating token
        // console.log(token);

        res.cookie("jwtp", token, {                     //storing the token as cookie
            expires: new Date(Date.now() + 300000),
            httpOnly: true
        });

        if (userEmail.Password === password) {
            res.status(201).redirect("/home_p");
        } else {
            res.send("password are not matching");
        }

    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/login",
        });
    }
})

//admin login check
app.post("/a-login", async (req, res) => {
    try {

        const id = req.body.id;
        const pass = req.body.pass;

        const userId = await Admin.findOne({ Aid: id });
        //console.log(userId);

        const token = await userId.generateAuthToken();    //generating token
        // console.log(token);

        res.cookie("jwta", token, {                     //storing the token as cookie
            expires: new Date(Date.now() + 300000),
            httpOnly: true
        });

        if (userId.password === pass) {
            res.status(201).redirect("/home_a");
        } else {
            res.send("password are not matching");
        }

    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/a-login",
        });
    }
})

//doctor login check
app.post("/d-login", async (req, res) => {
    try {

        const id = req.body.id;
        const pass = req.body.pass;

        const docId = await Doctor.findOne({ docId: id });
        // console.log(docId);

        const token = await docId.generateAuthToken();    //generating token
        //console.log(token);

        res.cookie("jwtd", token, {                     //storing the token as cookie
            expires: new Date(Date.now() + 300000),
            httpOnly: true
        });

        if (docId.password === pass) {
            res.status(201).redirect("/home_d");
        } else {
            res.send("password are not matching");
        }

    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/d-login",
        });
    }
})

//create doctor
app.post("/createdoc", auth_a, async (req, res) => {
    try {

        // const email = req.body.email;
        const mobile = req.body.num;
        const password = req.body.pass;

        if (!validator.isMobilePhone(mobile, 'en-IN') || !validator.isStrongPassword(password)) {

            res.status(400).render("sorry", {
                message: "Invalid Details",
                hreflink: "/createdoc",
            });

        } else {

            let seqDoc = await Autodoc.findOneAndUpdate({ Id: "uniqueId" }, { $inc: { Seq: 1 } }, { new: true });
            let id = "doc_id" + seqDoc.Seq;              //fetching data for incrementing the docId value
            // console.log(id);

            const doctorEmployee = new Doctor({

                docId: id,
                docname: req.body.doc,
                dob: req.body.dateb,
                qualification: req.body.qua,
                specialisation: req.body.spec,
                gender: req.body.gen,
                status: req.body.sta,
                pno: req.body.num,
                v_fees: req.body.vis,
                password: req.body.pass
            })

            const crdoctor = await doctorEmployee.save();
            res.status(201).redirect("/home_a");                     //redirecting it to the next page
        }

    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/home_a",
        });
    }
})

//create patient for admin
app.post("/addpa", auth_a, async (req, res) => {
    try {

        // const email = req.body.email;
        const mobile = req.body.num;
        // const password = req.body.pass;

        if (!validator.isMobilePhone(mobile, 'en-IN')) {

            res.status(400).render("sorry", {
                message: "Invalid Details",
                hreflink: "/addpa",
            });

        } else {

            let seqDoc = await Autopat.findOneAndUpdate({ Id: "uniqueId" }, { $inc: { Seq: 1 } }, { new: true });
            let id = "Pat_Id " + seqDoc.Seq;               //fetching data for incrementing the patId value
            // console.log(id);

            const patientEmployee = new Patient({
                patId: id,
                pname: req.body.pat,
                pdob: req.body.dateb,
                address: req.body.add,
                gender: req.body.gen,
                pno: req.body.num
            })

            const crpatient = await patientEmployee.save();
            res.status(201).redirect("/home_a");                     //redirecting it to the next page
        }

    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/home_a",
        });
    }
})

//create patient for patient
app.post("/addpatient_p", auth_p, async (req, res) => {
    try {

        // const email = req.body.email;
        const mobile = req.body.num;
        // const password = req.body.pass;

        if (!validator.isMobilePhone(mobile, 'en-IN')) {

            res.status(400).render("sorry", {
                message: "Invalid Details",
                hreflink: "/addpatient_p",
            });

        } else {

            let seqDoc = await Autopat.findOneAndUpdate({ Id: "uniqueId" }, { $inc: { Seq: 1 } }, { new: true });
            let id = "Pat_Id " + seqDoc.Seq;                //fetching data for incrementing the patId value
            // console.log(id);

            const patientEmployee = new Patient({
                patId: id,
                pname: req.body.pat,
                pdob: req.body.dateb,
                address: req.body.add,
                gender: req.body.gen,
                pno: req.body.num
            })

            const crpatient = await patientEmployee.save();
            res.status(201).redirect("/home_p");                     //redirecting it to the next page
        }

    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/home_p",
        });
    }
})

//book appointment for admin
app.post("/bookapp", auth_a, async (req, res) => {
    try {

        const Pname = req.body.p_name;
        const Dname = req.body.name;
        const Email = req.body.email;
        const Date = req.body.date;
        const Time = req.body.time;
        const Apay = req.body.apay;
        const Fpay = req.body.fpay;
        const userApp = await App.find({ date: Date });
        // console.log(userApp);

        const mobile = req.body.num;
        // const password = req.body.pass;

        if (!validator.isMobilePhone(mobile, 'en-IN') || !validator.isEmail(Email)) {

            res.status(400).render("sorry", {
                message: "Invalid Details",
                hreflink: "/check_a",
            });

        } else {

            let seqDoc = await Autoapp.findOneAndUpdate({ Id: "uniqueId" }, { $inc: { Seq: 1 } }, { new: true });
            let id = "App_Id " + seqDoc.Seq;              //fetching data for incrementing the docId value
            let token = seqDoc.Seq;
            // console.log(id);
            // console.log(token);

            const transporter = nodemailer.createTransport({             //sender email details

                host: "smtp-mail.outlook.com",
                service: 'outlook',
                auth: {
                    user: "project5thsemester@outlook.com",
                    pass: "project5"
                }

            });

            if (userApp.length === 0) {

                const appEmployee = new App({
                    appId: id,
                    pname: req.body.p_name,
                    dname: req.body.name,
                    date: req.body.date,
                    time: Time,
                    specialisation: req.body.spec,
                    pno: req.body.num,
                    email: req.body.email,
                    method: "Offline",
                    a_token: token,
                    a_payment: Apay,
                    f_payment: Fpay,
                    com: req.body.note
                })

                const booap = await appEmployee.save();

                const options = {                                       //sending email to the patient
                    from: "project5thsemester@outlook.com",
                    to: Email,
                    subject: "Appointment status",
                    text: `Hello ${Pname},your appointment with ${Dname} on ${Date} is booked successfully. 
                Token number : ${token}
                 Full payment : ${Fpay} `
                };

                transporter.sendMail(options, function (error, info) {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        console.log('Email sent: ' + info.response);
                    }
                });

                res.status(201).redirect("/home_a");                    //redirecting it to the next page

            }
            else {
                book = 0;

                for (let i = 0; i < userApp.length; i++) {         //for checking time slots in the database

                    if (userApp[i].time === Time) {
                        book = 1;
                    }

                }
                if (book === 1) {
                    res.send("This slot is already booked");
                }

                if (book === 0) {

                    const appEmployee = new App({
                        appId: id,
                        pname: req.body.p_name,
                        dname: req.body.name,
                        date: req.body.date,
                        time: Time,
                        specialisation: req.body.spec,
                        pno: req.body.num,
                        email: req.body.email,
                        method: "Offline",
                        a_token: token,
                        a_payment: Apay,
                        f_payment: Fpay,
                        com: req.body.note
                    })

                    const booap = await appEmployee.save();

                    const options = {                                       //sending email to the patient
                        from: "project5thsemester@outlook.com",
                        to: Email,
                        subject: "Appointment status",
                        text: `Hello ${Pname},your appointment with ${Dname} on ${Date} is booked successfully.
                    Token number : ${token}
                    Full payment : ${Fpay} `
                    };

                    transporter.sendMail(options, function (error, info) {
                        if (error) {
                            console.log(error);
                        }
                        else {
                            console.log('Email sent: ' + info.response);
                        }
                    });

                    res.status(201).redirect("/home_a");                 //redirecting it to the next page

                }

            }
        }

    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/home_a",
        });
    }
})

//book appointment for patient
app.post("/bookappointment_p", auth_p, async (req, res) => {
    try {

        const Pname = req.body.p_name;
        const Dname = req.body.name;
        const Email = req.body.email;
        const Date = req.body.date;
        const Time = req.body.time;

        const userApp = await App.find({ date: Date });
        // console.log(userApp);

        const mobile = req.body.num;
        // const password = req.body.pass;

        if (!validator.isMobilePhone(mobile, 'en-IN') || !validator.isEmail(Email)) {

            res.status(400).render("sorry", {
                message: "Invalid Details",
                hreflink: "/check_p",
            });

        } else {

            let seqDoc = await Autoapp.findOneAndUpdate({ Id: "uniqueId" }, { $inc: { Seq: 1 } }, { new: true });
            let id = "App_Id " + seqDoc.Seq;              //fetching data for incrementing the docId value
            let token = seqDoc.Seq;
            // console.log(id);
            // console.log(token);

            const transporter = nodemailer.createTransport({             //sender email details

                host: "smtp-mail.outlook.com",
                service: 'outlook',
                auth: {
                    user: "project5thsemester@outlook.com",
                    pass: "project5"
                }

            });

            if (userApp.length === 0) {

                const appEmployee = new App({
                    appId: id,
                    pname: req.body.p_name,
                    dname: req.body.name,
                    date: req.body.date,
                    time: Time,
                    specialisation: req.body.spec,
                    pno: req.body.num,
                    email: req.body.email,
                    method: "Online",
                    a_token: token,
                    a_payment: "",
                    f_payment: "",
                    com: req.body.note
                })

                const booap = await appEmployee.save();

                const options = {                                       //sending email to the patient
                    from: "project5thsemester@outlook.com",
                    to: Email,
                    subject: "Appointment status",
                    text: `Hello ${Pname},your appointment with ${Dname} on ${Date} is booked successfully and your token number is ${token} `
                };

                transporter.sendMail(options, function (error, info) {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        console.log('Email sent: ' + info.response);
                    }
                });



                res.status(201).redirect("/home_p");                    //redirecting it to the next page

            }
            else {
                book = 0;

                for (let i = 0; i < userApp.length; i++) {         //for checking time slots in the database

                    if (userApp[i].time === Time) {
                        book = 1;
                    }

                }
                if (book === 1) {
                    res.send("This slot is already booked");
                }

                if (book === 0) {

                    const appEmployee = new App({
                        appId: id,
                        pname: req.body.p_name,
                        dname: req.body.name,
                        date: req.body.date,
                        time: Time,
                        specialisation: req.body.spec,
                        pno: req.body.num,
                        email: req.body.email,
                        method: "Online",
                        a_token: token,
                        a_payment: "",
                        f_payment: "",
                        com: req.body.note
                    })

                    const booap = await appEmployee.save();

                    const options = {                                       //sending email to the patient
                        from: "project5thsemester@outlook.com",
                        to: Email,
                        subject: "Appointment status",
                        text: `Hello ${Pname},your appointment with ${Dname} on ${Date} is booked successfully and your token number is ${token} `
                    };

                    transporter.sendMail(options, function (error, info) {
                        if (error) {
                            console.log(error);
                        }
                        else {
                            console.log('Email sent: ' + info.response);
                        }
                    });

                    res.status(201).redirect("/home_p");                 //redirecting it to the next page

                }

            }

        }
    }
    catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/home_p",
        });
    }
})

//add schedule
app.post("/addsch", auth_a, async (req, res) => {
    try {

        let seqDoc = await Autosch.findOneAndUpdate({ Id: "uniqueId" }, { $inc: { Seq: 1 } }, { new: true });
        let id = seqDoc.Seq;              //fetching data for incrementing the docId value
        // console.log(id);

        const schEmployee = new Schedule({
            Sl_no: id,
            sdoc: req.body.sname,
            sdate: req.body.sdate,
            edate: req.body.edate,
            spec: req.body.spec,
            status: req.body.status
        })

        const booap = await schEmployee.save();
        res.status(201).redirect("/home_a");                     //redirecting it to the next page

    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/home_a",
        });
    }
})

//checking slot availability of doctor for patient
app.post("/check_p", auth_p, async (req, res) => {
    try {

        const Spec = req.body.spec;
        const date = req.body.cdate;
        // console.log(date);

        const userSch = await Schedule.findOne({ spec: Spec });
        // console.log(userSch.length);        
        // console.log(userSch.status);  

        const start = new Date(userSch.sdate);
        const end = new Date(userSch.edate);
        let loop = new Date(start);
        var demo = [];

        if (userSch.status === "Available") {

            // console.log("hello");
            const displayapp = await Doctor.find({ status: "Active" }, { docname: 1, _id: 0 });
            res.render("bookappointment_p", {
                Docname: displayapp,
                Datte: date
            });
            // console.log(displayapp);

        }
        else {

            // console.log("hello 1");
            if (userSch.edate === "") {

                if (userSch.sdate === date) {                  //checking whether the date is available or not

                    res.send("This doctor is on leave");

                }
                else {
                    const displayapp = await Doctor.find({ status: "Active" }, { docname: 1, _id: 0 });
                    res.render("bookappointment_p", {
                        Docname: displayapp,
                        Datte: date
                    });
                    // console.log(displayapp);
                }

            }
            else {

                copy = 0;

                for (let i = loop; i <= end; i.setDate(i.getDate() + 1)) {

                    let newDate = i;
                    demo.push(new Date(newDate).toISOString().substring(0, 10));
                    // converting date to string and removing time and saving it in an array

                }

                for (let i = 0; i < demo.length; i++) {         //for matching date's

                    if (demo[i] === date) {
                        copy = 1;
                    }
                }

                if (copy === 1) {
                    res.send("This doctor is on leave");
                }

                if (copy === 0) {
                    const displayapp = await Doctor.find({ status: "Active" }, { docname: 1, _id: 0 });
                    res.render("bookappointment_p", {
                        Docname: displayapp,
                        Datte: date
                    });
                    // console.log(displayapp);
                }
            }

            // console.log(demo[0]);
            // console.log(demo.length);

        }



    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/home_p",
        });
    }
})

//checking slot availability of doctor for patient
app.post("/check_a", auth_a, async (req, res) => {
    try {

        const Spec = req.body.spec;
        const date = req.body.cdate;
        // console.log(date);

        const userSch = await Schedule.findOne({ spec: Spec });
        // console.log(userSch);        
        // console.log(userSch.sdate);  

        const start = new Date(userSch.sdate);
        const end = new Date(userSch.edate);
        let loop = new Date(start);
        var demo = [];

        if (userSch.status === "Available") {

            // console.log("hello");
            const displayapp = await Doctor.find({ status: "Active" }, { docname: 1, _id: 0 });
            res.render("bookapp", {
                Docname: displayapp,
                Datte: date
            });
            // console.log(displayapp);

        }
        else {

            if (userSch.edate === "") {

                if (userSch.sdate === date) {                  //checking whether the date is available or not

                    res.send("This doctor is on leave");

                }
                else {
                    const displayapp = await Doctor.find({ status: "Active" }, { docname: 1, _id: 0 });
                    res.render("bookapp", {
                        Docname: displayapp,
                        Datte: date
                    });
                    // console.log(displayapp);
                }

            }
            else {

                copy = 0;

                for (let i = loop; i <= end; i.setDate(i.getDate() + 1)) {

                    let newDate = i;
                    demo.push(new Date(newDate).toISOString().substring(0, 10));
                    // converting date to string and removing time and saving it in an array

                }

                for (let i = 0; i < demo.length; i++) {         //for matching date's

                    if (demo[i] === date) {
                        copy = 1;
                    }
                }

                if (copy === 1) {
                    res.send("This doctor is on leave");
                }

                if (copy === 0) {
                    const displayapp = await Doctor.find({ status: "Active" }, { docname: 1, _id: 0 });
                    res.render("bookapp", {
                        Docname: displayapp,
                        Datte: date
                    });
                    // console.log(displayapp);
                }
            }

            // console.log(demo[0]);
            // console.log(demo.length);


        }


    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/home_a",
        });
    }
})

//cancel appointent Admin
app.post("/cancel_app", auth_a, async (req, res) => {
    const cancel = req.body.tok;
    const displayapp = await App.deleteOne({ a_token: cancel });
    res.redirect("/home_a");
});

//cancel appointent Patient
app.post("/cancelp_app", auth_p, async (req, res) => {
    const cancel = req.body.tok;
    const displayapp = await App.deleteOne({ a_token: cancel });
    res.redirect("/home_p");
});

//for searching details of patient
app.post("/patsearch", auth_a, async (req, res) => {

    const search = req.body.sea;
    const displayPat = await Patient.findOne({ pno: search });
    res.render("search_pat", {
        patlist: displayPat
    });
});

//for searching details of appointment
app.post("/appsearch", auth_a, async (req, res) => {

    const search = req.body.sea;
    const displayApp = await App.findOne({ pno: search });
    res.render("search_app", {
        applist: displayApp
    });
});

//for searching details of appointment
app.post("/appsearch_d", auth_d, async (req, res) => {

    const search = req.body.sea;
    const displayApp = await App.find({ specialisation: search });
    res.render("search_app_d", {
        applist: displayApp
    });
});

//for generating invoice
app.post("/payment", auth_a, async (req, res) => {
    const today = (function () {
        const now = new Date();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        return `${now.getFullYear()}-${month}-${day}`;
    });

    // console.log(today);
    // console.log("hello");

    res.render("invoice", {
        regToday: today       //displaying details
    });
});

//applicant's entry as doctor
app.post("/applicant", async (req, res) => {
    try {

        const email = req.body.ema;
        const mobile = req.body.num;
        // const password = req.body.pass;

        if (!validator.isMobilePhone(mobile, 'en-IN') || !validator.isEmail(email)) {

            res.status(400).render("sorry", {
                message: "Invalid Details",
                hreflink: "/applicant",
            });

        } else {

            const applicantEmployee = new Applicant({

                aplname: req.body.doc,
                dob: req.body.dateb,
                qualification: req.body.qua,
                specialisation: req.body.spec,
                gender: req.body.gen,
                status: "",
                email: req.body.ema,
                pno: req.body.num
            })

            const aplentry = await applicantEmployee.save();
            res.status(201).render("intro");                     //redirecting it to the next page
        }

    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/intro",
        });
    }
})

//applicant list for admin
app.get("/apllist", auth_a, async (req, res) => {

    const displayApl = await Applicant.find({});
    res.render("apllist", {
        regApl: displayApl      //displaying details
    });
});

//to accept applicant
app.get("/aplActive/:id", auth_a, async (req, res) => {
    try {

        const Id = req.params.id;
        const Editapl = await Applicant.findOne({ _id: Id });
        // console.log(Editapl);
        const Email = Editapl.email;
        const Name = Editapl.aplname;

        const Updateapl = await Applicant.updateOne({ _id: Id }, { $set: { status: "Accepted" } });

        const transporter = nodemailer.createTransport({             //sender email details

            host: "smtp-mail.outlook.com",
            service: 'outlook',
            auth: {
                user: "project5thsemester@outlook.com",
                pass: "project5"
            }
        });

        const options = {                                       //sending email to the patient
            from: "project5thsemester@outlook.com",
            to: Email,
            subject: "Appointment status",
            text: `Hello ${Name},your request is accepted and you are kindly requested to visit the clinic for further discussion.`
        };

        transporter.sendMail(options, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.redirect("/apllist");

    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/intro",
        });
    }
});

//to reject applicant
app.get("/aplNotactive/:id", auth_a, async (req, res) => {
    try {

        const Id = req.params.id;
        const Editapl = await Applicant.findOne({ _id: Id });
        // console.log(Editapl);
        const Email = Editapl.email;
        const Name = Editapl.aplname;

        const Updateapl = await Applicant.updateOne({ _id: Id }, { $set: { status: "Rejected" } });

        const transporter = nodemailer.createTransport({             //sender email details

            host: "smtp-mail.outlook.com",
            service: 'outlook',
            auth: {
                user: "project5thsemester@outlook.com",
                pass: "project5"
            }
        });

        const options = {                                       //sending email to the patient
            from: "project5thsemester@outlook.com",
            to: Email,
            subject: "Appointment status",
            text: `Hello ${Name},your request as an applicant is rejected.`
        };

        transporter.sendMail(options, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.redirect("/apllist");

    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/intro",
        });
    }
});

//to delete applicant details
app.get("/aplDelete/:id", auth_a, async (req, res) => {
    try {

        const Id = req.params.id;
        const Editapl = await Applicant.deleteOne({ _id: Id });
        console.log(Editapl);
        res.redirect("/apllist");

    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/intro",
        });
    }
});

//to activate doctor status
app.get("/docActive/:id", auth_a, async (req, res) => {
    try {

        const Id = req.params.id;
        const Editapl = await Doctor.findOne({ _id: Id });
        // console.log(Editapl);

        const Updateapl = await Doctor.updateOne({ _id: Id }, { $set: { status: "Active" } });

        res.redirect("/doclist");

    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/intro",
        });
    }
});

//to de-activate doctor status
app.get("/docNotactive/:id", auth_a, async (req, res) => {
    try {

        const Id = req.params.id;
        const Editapl = await Doctor.findOne({ _id: Id });
        // console.log(Editapl);

        const Updateapl = await Doctor.updateOne({ _id: Id }, { $set: { status: "NotActive" } });

        res.redirect("/doclist");

    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/intro",
        });
    }
});

//reset password for patient
app.get("/reset", (req, res) => {
    res.render("reset")
});

//reset password for patient
app.post("/reset", async (req, res) => {

    try {
        const E_mail = req.body.email;
        const Pass = req.body.pass;

        if (!validator.isEmail(E_mail) || !validator.isStrongPassword(Pass)) {

            res.status(400).render("sorry", {
                message: "Invalid Details",
                hreflink: "/index",
            });

        } else {

            const updateRes = await Register.updateOne({ Email: E_mail }, { $set: { Password: Pass } });

            res.render("login");
        }

    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/intro",
        });
    }

});

//for invoice
app.post("/invoice", auth_a, async (req, res) => {

    try {
        let dat = req.body.inv;
        // console.log(dat);
        const invEmployee = new Invoice({
            dname: req.body.dn,
            date: dat,
            detail: req.body.det,
            amount: req.body.amn
        })

        const booap = await invEmployee.save();
        const id = invEmployee.dname;

        res.redirect("/download");

    } catch (error) {
        res.status(400).render("sorry", {
            message: "Something went wrong",
            hreflink: "/home_a",
        });
    }

});

//download invoice
app.get('/download/:id', (req, res) => {

    const id = req.params.id;
    console.log(id);
    res.render("download")
});

app.listen(port, () => {
    console.log(`server is running at port no. ${port}`);
})