import mongoose from "mongoose";


const auctionSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    startingBid: {
        type: Number,
        required: true,
    },
    highestBid: {
        type: Number,
        default: 0,
    },
    highestBidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    startTime: {
        type: Date,
    },
    endTime: {
        type: Date,
    },
    state: {
        type:String,
        enum:['pending','active','completed','cancelled'],
        default:'pending',
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },

})

const Auction = mongoose.model('Auction',auctionSchema)


export default Auction