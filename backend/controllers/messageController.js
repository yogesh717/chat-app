import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";
import User from "../models/user.js";

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        console.log("senderId", senderId);
        const receiverId = req.params.id;
        console.log("receiverId", receiverId);
        const { message } = req.body;
        console.log("message", message);

        // Fetch sender name
        const sender = await User.findById(senderId);
        if (!sender) {
            return res.status(404).json({ error: "Sender not found" });
        }

        let gotConversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        }).populate({
            path: "messages",
            model: "Message",
        });

        if (!gotConversation) {
            gotConversation = await Conversation.create({
                participants: [senderId, receiverId],
                messages: []  
            });
        }

        const newMessage = await Message.create({
            senderId,
            senderName: sender.fullName,  
            receiverId,
            message,
            status: "sent",
        });

        gotConversation.messages.push(newMessage._id);
        await gotConversation.save();

        return res.status(201).json(newMessage);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


export const getMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;

        console.log("Fetching messages between:", senderId, receiverId);

        let getConversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        }).populate({
            path: "messages",
            model: "Message",
            select: "senderId senderName receiverId message createdAt", 
        });

        if (!getConversation || !getConversation.messages.length) {
            return res.status(200).json([]);  
        }

        console.log("Fetched Messages:", getConversation.messages);
        return res.status(200).json(getConversation.messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

//  Update message status (delivered/read)
export const updateMessageStatus = async (req, res) => {
    try {
        const { messageId, status } = req.body;
        const updatedMessage = await Message.findByIdAndUpdate(
            messageId,
            { status },
            { new: true }
        );

        if (!updatedMessage) {
            return res.status(404).json({ error: "Message not found" });
        }

        return res.status(200).json(updatedMessage);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

