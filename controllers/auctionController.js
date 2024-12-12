import Auction from "../models/auctionModel.js";
import Bid from "../models/bidModel.js";

export const createAuction = async (req, res) => {
    const { itemName, description, startingBid, startTime, endTime } = req.body;

    if (!itemName || !description || !startingBid || !endTime) {
        return res.status(400).json({ message: "All fields must be provided" });
    }
    const createdBy = req.user.userId


    try {
        const auction = new Auction({
            itemName,
            description,
            startingBid,
            startTime,
            endTime,
            createdBy,
        });

        const savedAuction = await auction.save();
        res.status(201).json(savedAuction);
    } catch (error) {
        res.status(500).json({ message: "Error creating auction", error: error.message });
    }
}

export const getAllAuctions = async (req, res) => {
    try {
        const auctions = await Auction.find().populate("createdBy", "firstName email");
        res.status(200).json(auctions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching auctions", error: error.message });
    }
}

export const getAuction = async (req, res) => {
    const { id } = req.params;

    try {
        const auction = await Auction.findById(id).populate("createdBy", "firstName email").populate("highestBidder", "firstName email");
        if (!auction) {
            return res.status(404).json({ message: "Auction not found" });
        }
        res.status(200).json(auction);
    } catch (error) {
        res.status(500).json({ message: "Error fetching auction", error: error.message });
    }
}

export const getCreatedAuctions = async (req, res) => {
    const userId = req.user.userId;

    try {
        const auctions = await Auction.find({ creator: userId });

        if (auctions.length === 0) {
            return res.status(404).json({ message: 'No auctions are created by this user.' });
        }
        return res.status(200).json({ auctions });
    } catch (error) {
        console.error('Error fetching auctions:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const getParticipatedAuctions = async (req, res) => {

    const userId = req.user.userId;

    try {
        const bids = await Bid.find({ bidder: userId });

        if (bids.length === 0) {
            return res.status(404).json({ message: 'No auctions found for this user.' });
        }

        const auctionIds = [...new Set(bids.map(bid => bid.auction.toString()))];

        const auctions = await Auction.find({ '_id': { $in: auctionIds } });
        return res.status(200).json({ auctions });
    } catch (error) {
        console.error('Error fetching auctions:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}



