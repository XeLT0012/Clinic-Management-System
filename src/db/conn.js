const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/5th_sem_project").then(() => {
    console.log(`connection successful`);
}).catch((e) => {
    console.log(`no connection`);
})                                 //connected database