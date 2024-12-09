import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import http from 'http'
import { Server } from 'socket.io'
import { auctionRoute, authRoute, bidRoute, chatRoute, userRoute } from './routes/index.js'
import { verifyToken } from './middleware/authMiddleware.js'


dotenv.config()


const app = express()

const server = http.createServer(app)
const io = new Server(server)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/v1/auth", authRoute)
app.use("/api/v1/user", verifyToken, userRoute)
app.use("/api/v1/auction", verifyToken, auctionRoute)
app.use("/api/v1/chat", verifyToken, chatRoute)
app.use("/api/v1/bid", verifyToken, bidRoute)


const chatNameSpace = io.of("/chat");
const auctionNameSpace = io.of("/auction");

chatNameSpace.on('connection', (socket) => {
    console.log(`chat user connected: ${socket.id}`);

    socket.on('send-message', (data) => {
        console.log(data);

        const { chatRoomId, message, user } = data
        chatNameSpace.to(chatRoomId).emit('receive-message', { user, message })

    })
    socket.on('join-chat', (data) => {
        socket.join(data.chatRoomId)
        console.log(`${socket.id} joined chat room : ${data.chatRoomId}`);
    })

    socket.on('disconnect', () => {
        console.log('Chat user disconnected:', socket.id);

    })
})

auctionNameSpace.on("connection", (socket) => {
    console.log(`Auction user connected: ${socket.id}`);
    socket.on('place-bid', (data) => {
        auctionNameSpace
    })
})

const PORT = process.env.PORT || 5000


server.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
})