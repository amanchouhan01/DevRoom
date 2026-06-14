import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        _id: { type: String, required: true },
        email: { type: String, required: true }
    },
    message: {
        type: String,
        required: true
    }
}, { timestamps: true })


const inviteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    invitedBy: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        name: String,
        email: String
    },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true })


const emailInviteSchema = new mongoose.Schema({
    email: { type: String, required: true, lowercase: true, trim: true },
    invitedBy: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        name: String,
        email: String
    },
    status: { type: String, enum: ['pending', 'accepted'], default: 'pending' }
}, { timestamps: true })


const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true,
        unique: true,
    },

    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        }
    ],

    fileTree: {
        type: Object,
        default: {}
    },
    messages: [messageSchema],
    pendingInvites: [inviteSchema],
    emailInvites: [emailInviteSchema]
},
    { timestamps: true }
)



const Project = mongoose.model('project', projectSchema)

export default Project;