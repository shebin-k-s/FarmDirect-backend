import express from "express";
import { createAuction, getAllAuctions, getAuction, getCreatedAuctions, getParticipatedAuctions } from "../controllers/auctionController.js";

const router = express.Router()


router.route('/')
    .get(getAllAuctions)

router.route('/create')
    .post(createAuction)

router.route("/:auctionId")
    .get(getAuction)

router.route("/my-auctions")
    .get(getCreatedAuctions)

router.route("/participated")
    .get(getParticipatedAuctions)
    

export default router
