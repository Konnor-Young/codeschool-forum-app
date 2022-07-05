const mongoose = require(`mongoose`);

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true, 
        unique: true, 
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 
            `please use a valid email.`
        ]},
    fullname: {type: String, required: true},
    password: {type: String, required: true},
});

const User = mongoose.model("User", userSchema);

module.exports = {
    User: User
}