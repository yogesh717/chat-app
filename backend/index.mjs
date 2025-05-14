import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/messageRoutes.js";
import cookieParser from "cookie-parser";
import User from "./models/user.js";
import {Message } from "./models/messageModel.js"; 



const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

const port = 5000;
const onlineUsers = new Map(); 



app.use(cors({ origin: "http://localhost:3000", credentials: true }));
// app.use(express.json());
app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ extended: true, limit: "10mb" })); 
// app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.use("/users", userRoutes);
app.use("/messages", messageRoutes);

mongoose
    .connect("mongodb://localhost:27017/chat-api2")
    .then(() => {
        console.log("Connected to the database!");
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("Cannot connect to the database!", err);
    });

// WebSocket Connection Handling
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("userOnline", async (userId) => {
        onlineUsers.set(userId, socket.id);
        io.emit("updateUserStatus", { userId, status: "online" });

        // Update status in database
        await User.findByIdAndUpdate(userId, { status: "online" });

        console.log(`User Online: ${userId}`);
    });

    socket.on("joinChat", (chatRoom) => {
        socket.join(chatRoom);
        console.log(`User joined chat room: ${chatRoom}`);
    });

    socket.on("sendMessage", async (messageData) => {
        const { senderId, receiverId } = messageData;
        const chatRoom = [senderId, receiverId].sort().join("_");

        io.to(chatRoom).emit("receiveMessage", messageData);
        console.log(`Message sent to room: ${chatRoom}`, messageData);
    });

    socket.on("typing", ({ senderId, receiverId }) => {
        const chatRoom = [senderId, receiverId].sort().join("_");
        io.to(chatRoom).emit("userTyping", { senderId });
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
        const chatRoom = [senderId, receiverId].sort().join("_");
        io.to(chatRoom).emit("userStoppedTyping", { senderId });
    });


    socket.on("messageSeen", async ({ messageId, receiverId }) => {
        try {
            const message = await Message.findByIdAndUpdate(messageId, { isRead: true }, { new: true });
    
            if (message) {
                io.to(onlineUsers.get(receiverId)).emit("messageReadUpdate", { messageId });
            }
        } catch (error) {
            console.error("Error updating message read status:", error);
        }
    });
    
    socket.on("disconnect", async () => {
        const userId = [...onlineUsers.entries()].find(([_, id]) => id === socket.id)?.[0];
        if (userId) {
            onlineUsers.delete(userId);
            io.emit("updateUserStatus", { userId, status: "offline" });

            // Update status in database
            await User.findByIdAndUpdate(userId, { status: "offline" });
        }
        console.log(`User Disconnected: ${socket.id}`);
    });
});

    