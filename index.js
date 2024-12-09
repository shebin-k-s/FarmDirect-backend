import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import http from 'http'
import { Server } from 'socket.io'
import { log } from 'console'


dotenv.config()


const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const server = http.createServer(app)
const io = new Server(server)



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

auctionNameSpace.on("connection",(socket) => {
    console.log(`Auction user connected: ${socket.id}`);
    socket.on('place-bid',(data) => {
        auctionNameSpace
    })   
})

const PORT = process.env.PORT || 5000


server.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
})