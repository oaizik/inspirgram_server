const { Schema, model } = require('mongoose');

const user = {
    userId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    userType: {
        type: String,
        required: true,
        enum: ["client", "writer"]
     },
    userRegistrationType: {type:String, required:true, enum: ['facebook','email']} ,
    isActive: {type: Boolean , default: true},
};

const userSchema = new Schema(user);
const User = model('User', userSchema);

module.exports = User;
