import express from "express";
import { getBids } from "../controllers/bidController.js";

const router = express.Router()

router.route('/:auctionId')
    .get(getBids)




export default router
