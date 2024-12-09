import mongoose, { mongo } from 'mongoose'


const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
    },
    phoneNumber: {
        type: Number,
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
    bidHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bid'
    }],
    auctionhistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction'
    }]
})

const User = mongoose.model('User', userSchema);


export default User