import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
        minLength: [3, 'Name must be at least 3 characters long'],
        maxLength: [30, 'Name must not be longer than 30 characters']
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: [6, 'Email must be at least 6 characters long'],
        maxLength: [50, 'Email must not be longer than 50 charactes']
    },

    password: {
        type: String,
        select: false,
    },

    isVerified: { type: Boolean, default: false },

    avatar: {
        type: String,
        default: ''
    },

    emailChangeOTP: { type: String },
    emailChangeOTPExpiry: { type: Date },
    pendingEmail: { type: String },

    resetPasswordOTP: { type: String },
    resetPasswordOTPExpiry: { type: Date },

    googleId: {
    type: String,
    default: null
}

}, { timestamps: true })

userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
}

userSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateJWT = function () {
    return jwt.sign({ _id: this._id, email: this.email, name: this.name },
        process.env.JWT_SECRET,
        { expiresIn: '24h' });
}

const User = mongoose.model('user', userSchema);

export default User;