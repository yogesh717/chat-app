import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import multer from "multer";
import userRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/messageRoutes.js";
import cookieParser from "cookie-parser";
import User from "./models/user.js";
import {Message } from "./models/messageModel.js";
import { getChatRoomId } from "./utils/chatRoom.js";



const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});
app.set("io", io);

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

// Centralized error handler (catches multer file-validation errors, etc.)
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err) {
        return res.status(400).json({ success: false, message: err.message });
    }
    next();
});

mongoose
    .connect(process.env.MONGO_URI || "mongodb://localhost:27017/chat-api2")
    .then(() => {
        console.log("Connected to the database!");
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("Cannot connect to the database!", err);
    });

// Authenticate every socket connection using the same JWT issued by login/signup.
// Never trust a client-supplied userId — identity always comes from the verified token.
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("Authentication error: no token"));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.userId) return next(new Error("Authentication error: invalid token"));

        const user = await User.findById(decoded.userId).select("isActive");
        if (!user || !user.isActive) {
            return next(new Error("Authentication error: account deactivated or not found"));
        }

        socket.userId = String(decoded.userId);
        next();
    } catch (error) {
        next(new Error("Authentication error: invalid token"));
    }
});

// WebSocket Connection Handling
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id} (userId: ${socket.userId})`);

    socket.on("userOnline", () => {
        const userId = socket.userId;
        onlineUsers.set(userId, socket.id);
        io.emit("updateUserStatus", { userId, status: "online" });
        console.log(`User Online: ${userId}`);
    });

    socket.on("joinChat", (chatRoom) => {
        const parts = typeof chatRoom === "string" ? chatRoom.split("_") : [];
        if (parts.length !== 2 || !parts.includes(socket.userId)) {
            return socket.emit("joinChatError", { message: "Not authorized to join this chat" });
        }
        socket.join(chatRoom);
        console.log(`User joined chat room: ${chatRoom}`);
    });

    socket.on("sendMessage", async (messageData) => {
        const { senderId, receiverId } = messageData;
        if (senderId !== socket.userId) {
            return socket.emit("joinChatError", { message: "Not authorized to send as this user" });
        }
        const chatRoom = getChatRoomId(senderId, receiverId);

        io.to(chatRoom).emit("receiveMessage", messageData);
        console.log(`Message sent to room: ${chatRoom}`, messageData);
    });

    // TODO(phase2): validate senderId against socket.userId here too (same spoofing
    // class as joinChat/sendMessage, deferred to keep this change scoped).
    socket.on("typing", ({ senderId, receiverId }) => {
        const chatRoom = getChatRoomId(senderId, receiverId);
        io.to(chatRoom).emit("userTyping", { senderId });
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
        const chatRoom = getChatRoomId(senderId, receiverId);
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
        const userId = socket.userId;
        if (userId) {
            onlineUsers.delete(userId);
            io.emit("updateUserStatus", { userId, status: "offline" });
            await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
        }
        console.log(`User Disconnected: ${socket.id}`);
    });
});

    