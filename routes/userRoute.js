import express from "express";
import { createAuction, getCreatedAuctions, getParticipatedAuctions } from "../controllers/auctionController.js";
import { upload } from "../config/multerConfig.js";

const router = express.Router()


router.route('/create-auction')
    .post(upload.array('auctionImages', 5), createAuction);

router.route("/my-auctions")
    .get(getCreatedAuctions)

router.route("/participated-auctions")
    .get(getParticipatedAuctions)


export default router
