import express from "express";
import { getAllAuctions, getAuction } from "../controllers/auctionController.js";

const router = express.Router()


router.route('/')
    .get(getAllAuctions)

router.route("/:auctionId")
    .get(getAuction)


export default router
