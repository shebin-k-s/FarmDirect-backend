import mongoose, { mongo } from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiver: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['sent', 'received', 'seen'],
        default: 'sent',
    },
    sendAt: {
        type: Date,
        default: Date.now,
    }
})

const Message = mongoose.model('Message', messageSchema)

export default Message