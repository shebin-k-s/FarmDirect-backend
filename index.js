import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import http from 'http'
import { Server } from 'socket.io'
import { auctionRoute, authRoute, bidRoute, chatRoute, userRoute } from './routes/index.js'
import { verifyToken } from './middleware/authMiddleware.js'
import Auction from './models/auctionModel.js'
import Bid from './models/bidModel.js'


dotenv.config()


const app = express()

const server = http.createServer(app)
const io = new Server(server)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/v1/auth", authRoute)
app.use("/api/v1/auction", auctionRoute)
app.use("/api/v1/user", verifyToken, userRoute)
app.use("/api/v1/chat", verifyToken, chatRoute)
app.use("/api/v1/bid", verifyToken, bidRoute)


const connectedUsers = new Map();
app.set('connectedUsers', connectedUsers);

const chatNameSpace = io.of("/chat");
const auctionNameSpace = io.of("/auction");

app.set('chatNameSpace', chatNameSpace);

chatNameSpace.on('connection', async (socket) => {
    console.log('A user connected');

    const token = socket.handshake.query.token || socket.handshake.headers['authorization'];
    if (!token) {
        console.log('No token provided');
        return socket.disconnect();
    }

    try {
        const decodedToken = Jwt.verify(token, process.env.JWT_TOKEN);
        const userId = decodedToken.userId;

        const initializationComplete = new Promise(async (resolve) => {
            connectedUsers.set(userId, { socketId: socket.id, interactingWith: null });

            try {
                const messagesToUpdate = await Message.updateMany(
                    { receiver: userId, status: 'sent' },
                    { $set: { status: 'received' } }
                );
                console.log(`Updated ${messagesToUpdate.modifiedCount} messages to "received" for user ${userId}`);
            } catch (error) {
                console.log(error);
            }

            resolve();
        });

        await initializationComplete;


        socket.isReady = true;

        socket.on('startInteraction', (interactingUserId) => {
            if (!socket.isReady) {
                console.log('Socket not ready, ignoring startInteraction event');
                return;
            }

            const userData = connectedUsers.get(userId);
            if (userData) {
                userData.interactingWith = interactingUserId;
                connectedUsers.set(userId, userData);
            }
            console.log(`User ${userId} started interacting with ${interactingUserId}`);
        });

        socket.on('stopInteraction', () => {
            if (!socket.isReady) {
                console.log('Socket not ready, ignoring stopInteraction event');
                return;
            }

            const userData = connectedUsers.get(userId);
            if (userData) {
                userData.interactingWith = null;
                connectedUsers.set(userId, userData);
            }
            console.log(`User ${userId} stopped interacting`);
        });

        socket.on('messageSeen', async (receiverId) => {
            if (!socket.isReady) {
                console.log('Socket not ready, ignoring messageSeen event');
                return;
            }

            console.log(`id : ${receiverId}`);
            try {
                const result = await Message.updateMany(
                    { sender: receiverId, receiver: userId, status: { $ne: 'seen' } },
                    { $set: { status: 'seen' } }
                );
                console.log(`Updated ${result.modifiedCount} messages to "seen" for user ${userId} from ${receiverId}`);
            } catch (error) {
                console.error('Error updating message status to "seen":', error);
            }
        });

        socket.on('disconnect', () => {
            connectedUsers.forEach((value, key) => {
                if (value === socket.id) {
                    connectedUsers.delete(key);
                }
            });
            console.log('A user disconnected');
        });

        socket.emit('ready');

    } catch (error) {
        console.log('Failed to authenticate token');
        return socket.disconnect();
    }
})

auctionNameSpace.on('connection', async (socket) => {
    console.log(`Auction user connected: ${socket.id}`);

    const token = socket.handshake.query.token || socket.handshake.headers['authorization'];
    if (!token) {
        console.log('No token provided for auction namespace');
        return socket.disconnect();
    }

    try {
        const decodedToken = Jwt.verify(token, process.env.JWT_TOKEN);
        const userId = decodedToken.userId;

        console.log(`User authenticated for auction namespace: ${userId}`);

        socket.on('join-auction', async (auctionId) => {
            try {
                const auction = await Auction.findById(auctionId);
                if (!auction) {
                    socket.emit('auction-error', { message: 'Auction not found' });
                    return;
                }
                socket.join(auctionId);
            } catch (error) {
                console.error('Error joining auction:', error);
                socket.emit('auction-error', { message: 'Failed to join auction' });
            }
        });

        socket.on('place-bid', async (data) => {
            const { auctionId, bidAmount } = data;

            try {
                const auction = await Auction.findById(auctionId);
                if (!auction) {
                    auctionNameSpace.to(auctionId).emit('bid-error', { message: 'Invalid auction.' });
                    return;
                }

                if (bidAmount <= auction.highestBid) {
                    auctionNameSpace.to(auctionId).emit('bid-error', { message: 'Bid amount too low.' });
                    return;
                }

                auction.highestBid = bidAmount;
                auction.highestBidder = userId;
                await auction.save();

                auctionNameSpace.to(auctionId).emit('bid-updated', {
                    auctionId,
                    bidAmount,
                    userId,
                });

                const newBid = new Bid({
                    auction: auctionId,
                    bidder: userId,
                    amount: bidAmount,
                });

                await newBid.save();

            } catch (error) {
                console.error('Error placing bid:', error);
                auctionNameSpace.to(auctionId).emit('bid-error', { message: 'Failed to place bid.' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`Auction user disconnected: ${socket.id}`);
        });

    } catch (error) {
        console.error('Failed to authenticate token in auction namespace:', error.message);
        return socket.disconnect();
    }
});




const PORT = process.env.PORT || 5000
mongoose.connect(process.env.CONNECTION_URL)
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server running at port ${PORT}`);
        })
    })
    .catch((error) => {
        console.log(error);
    });


