const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String, required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Invaid email address"
        ],
        unique: [true, "Email already exist"]
    },
    name: {
        type: String, required: [true, "Name is required"],

    },
    password: {
        type: String, required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
        select: false// when we will fetch user it will not return password until asked

    },
    systemUser: {
        type: Boolean, default: false,
        immutable: true,// it will not allow to change the value once set 
        select: false// it will not return systemUser field when we fetch user unless asked explicitly
    }

}, {
    timestamps: true
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return
    }
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    return
})


userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;