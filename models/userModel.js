import mongoose, { mongo } from 'mongoose'


const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
    },
    phoneNumber: {
        type: String,
        unique: true,
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    address: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
})

const User = mongoose.model('User', userSchema);


export default User