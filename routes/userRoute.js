import express from "express";
import { createAuction, getCreatedAuctions, getParticipatedAuctions } from "../controllers/auctionController.js";

const router = express.Router()


router.route('/create-auction')
    .post(createAuction)

router.route("/my-auctions")
    .get(getCreatedAuctions)

router.route("/participated-auctions")
    .get(getParticipatedAuctions)


export default router
