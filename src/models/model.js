const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const validator = require("validator");


//For registration of patient
const employeeSchema = new mongoose.Schema({
    FirstName: {
        type: String,
        required: true
    },
    LastName: {
        type: String,
        required: true
    },
    pno: {
        type: String,
        required: true,
        unique: true,
    },
    Age: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true,
        unique: true,
    },
    Daate: {
        type: String,
        required: true
    },
    Gender: {
        type: String,
        required: true
    },
    Password: {
        type: String,
        required: true,
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]

})

//generating tokens
employeeSchema.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign({ _id: this._id.toString() }, "ournamesaresumitchakrabortyandbhaskarjyotikumar");   //secret key
        this.tokens = this.tokens.concat({ token: token })
        await this.save();
        return token;
    } catch (error) {
        res.send("the error part" + error);
        console.log("the error part" + error);
    }

}


//for adding or registering doctor
const doctorSchema = new mongoose.Schema({
    docId: {
        type: String,
        required: true
    },
    docname: {
        type: String,
        required: true
    },
    dob: {
        type: String,
        required: true
    },
    qualification: {
        type: String,
        required: true
    },
    specialisation: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    pno: {
        type: String,
        required: true,
        unique: true,
    },
    v_fees: {
        type: String
    },
    password: {
        type: String,
        required: true,
        unique: true,
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]

})

//generating tokens 
doctorSchema.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign({ _id: this._id.toString() }, "ournamesaresumitchakrabortyandbhaskarjyotikumar");   //secret key
        this.tokens = this.tokens.concat({ token: token })
        await this.save();
        return token;
    } catch (error) {
        res.send("the error part" + error);
        console.log("the error part" + error);
    }

}


//for create patient
const patientSchema = new mongoose.Schema({
    patId: {
        type: String,
        required: true
    },
    pname: {
        type: String,
        required: true
    },
    pdob: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true
    },
    pno: {
        type: String,
        required: true,
        unique: true,
    }

})

//for book appointment
const appSchema = new mongoose.Schema({
    appId: {
        type: String,
    },
    pname: {
        type: String,
        required: true
    },
    dname: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    specialisation: {
        type: String,
        required: true
    },
    pno: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    method: {
        type: String
    },
    a_token: {
        type: String
    },
    a_payment: {
        type: String
    },
    f_payment: {
        type: String
    },
    com: {
        type: String,
        required: true
    }

})


//for add schedule
const scheduleSchema = new mongoose.Schema({
    Sl_no: {
        type: String,
        required: true
    },
    sdoc: {
        type: String,
        required: true
    },
    sdate: {
        type: String

    },
    edate: {
        type: String
    },
    spec: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
})

//for add admin details
const adminSchema = new mongoose.Schema({
    Aid: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        unique: true,
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

//generating tokens
adminSchema.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign({ _id: this._id.toString() }, "ournamesaresumitchakrabortyandbhaskarjyotikumar");   //secret key
        this.tokens = this.tokens.concat({ token: token })
        await this.save();
        return token;
    } catch (error) {
        res.send("the error part" + error);
        console.log("the error part" + error);
    }

}

//for adding or registering doctor
const applicantSchema = new mongoose.Schema({
    aplname: {
        type: String,
        required: true
    },
    dob: {
        type: String,
        required: true
    },
    qualification: {
        type: String,
        required: true
    },
    specialisation: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    status: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    pno: {
        type: String,
        required: true,
        unique: true,
    }

})

//for adding or registering doctor
const invoiceSchema = new mongoose.Schema({
    dname: {
        type: String,
        required: true
    },
    date: {
        type: String
    },
    detail: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    }

})

//for auto generating id of doctor
const autodocSchema = new mongoose.Schema({
    Id: {
        type: String
    },
    Seq: {
        type: Number
    }
})

//for auto generating id of patient
const autopatSchema = new mongoose.Schema({
    Id: {
        type: String
    },
    Seq: {
        type: Number
    }
})

//for auto generating id of appointment
const autoappSchema = new mongoose.Schema({
    Id: {
        type: String
    },
    Seq: {
        type: Number
    }
})

//for auto generating id of appointment
const autoschSchema = new mongoose.Schema({
    Id: {
        type: String
    },
    Seq: {
        type: Number
    }
})

//now we need to create a collection for registration

const Register = new mongoose.model("Register", employeeSchema);

//now we need to create a collection for create doctor

const Doctor = new mongoose.model("doctor", doctorSchema);

//now we need to create a collection for create patient

const Patient = new mongoose.model("patient", patientSchema);

//now we need to create a collection for book appointment

const App = new mongoose.model("appointment", appSchema);

//now we need to create a collection for add schedule

const Schedule = new mongoose.model("schedule", scheduleSchema);

//now we need to create a collection for add schedule

const Admin = new mongoose.model("admin", adminSchema);

//now we need to create a collection for taking applicant details

const Applicant = new mongoose.model("applicant", applicantSchema);

//now we need to create a collection for taking invoice details

const Invoice = new mongoose.model("invoice", invoiceSchema);

//now we need to create a collection for incrementing docId

const Autodoc = new mongoose.model("doccounter", autodocSchema);

//now we need to create a collection for incrementing patId

const Autopat = new mongoose.model("patcounter", autopatSchema);

//now we need to create a collection for incrementing appId and Pat_token

const Autoapp = new mongoose.model("appcounter", autoappSchema);

//now we need to create a collection for incrementing leave sl_no.

const Autosch = new mongoose.model("schcounter", autoschSchema);

module.exports = { Register, Doctor, Patient, App, Schedule, Admin, Applicant, Invoice, Autodoc, Autopat, Autoapp, Autosch };