import Bid from "../models/bidModel.js";


export const getBids = async (req, res) => {
    const { auctionId } = req.params;

    try {
        const bids = await Bid.find({ auction: auctionId })
            .populate('bidder', 'firstName email')
            .sort({ timestamp: -1 });

        if (bids.length === 0) {
            return res.status(404).json({ message: 'No bids found for this auction.' });
        }

        return res.status(200).json({ bids });
    } catch (error) {
        console.error('Error fetching bids:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }

}