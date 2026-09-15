import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";
import User from "../models/user.js";
import { getChatRoomId } from "../utils/chatRoom.js";
import { inferMessageType } from "../middleware/messageUpload.js";

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const { message, replyTo } = req.body;

        const trimmedMessage = (message || "").trim();
        if (!trimmedMessage && !req.file) {
            return res.status(400).json({ error: "Message cannot be empty" });
        }

        // Fetch sender name
        const sender = await User.findById(senderId);
        if (!sender) {
            return res.status(404).json({ error: "Sender not found" });
        }

        let gotConversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!gotConversation) {
            gotConversation = await Conversation.create({
                participants: [senderId, receiverId],
                messages: []
            });
        }

        const messageData = {
            senderId,
            senderName: sender.fullName,
            receiverId,
            message: trimmedMessage,
            status: "sent",
        };

        if (req.file) {
            messageData.messageType = inferMessageType(req.file.mimetype);
            messageData.attachment = {
                url: `${req.protocol}://${req.get("host")}/uploads/messages/${req.file.filename}`,
                fileName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
            };
        }

        if (replyTo) {
            const original = await Message.findOne({
                _id: replyTo,
                $or: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId },
                ],
            });
            if (original) {
                messageData.replyTo = original._id;
                messageData.replyPreview = {
                    messageId: original._id,
                    senderId: original.senderId,
                    senderName: original.senderName,
                    message: original.isDeletedForEveryone
                        ? "This message was deleted"
                        : (original.message || "").slice(0, 120),
                    messageType: original.messageType,
                };
            }
        }

        const newMessage = await Message.create(messageData);

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

        let getConversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        }).populate({
            path: "messages",
            model: "Message",
            match: { deletedFor: { $ne: senderId } },
            select: "senderId senderName receiverId message status messageType attachment "
                + "replyTo replyPreview edited editedAt isDeletedForEveryone isForwarded "
                + "reactions isPinned pinnedBy pinnedAt starredBy createdAt",
        });

        if (!getConversation || !getConversation.messages.length) {
            return res.status(200).json([]);
        }

        return res.status(200).json(getConversation.messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getConversations = async (req, res) => {
    try {
        const userId = req.id;

        const conversations = await Conversation.find({ participants: userId })
            .sort({ updatedAt: -1 })
            .populate("participants", "fullName userName profileImage");

        const results = await Promise.all(
            conversations.map(async (conv) => {
                const otherUser = conv.participants.find(
                    (p) => p._id.toString() !== userId
                );
                if (!otherUser) return null;

                const lastMessage = await Message.findOne({
                    _id: { $in: conv.messages },
                    deletedFor: { $ne: userId },
                })
                    .sort({ createdAt: -1 })
                    .select("message senderId createdAt status messageType isDeletedForEveryone attachment");

                let lastMessagePreview = lastMessage;
                if (lastMessage) {
                    let previewText = lastMessage.message;
                    if (lastMessage.isDeletedForEveryone) {
                        previewText = "This message was deleted";
                    } else if (lastMessage.messageType === "image") {
                        previewText = "📷 Photo";
                    } else if (lastMessage.messageType === "video") {
                        previewText = "🎥 Video";
                    } else if (lastMessage.messageType === "audio") {
                        previewText = "🎤 Audio";
                    } else if (lastMessage.messageType === "file") {
                        previewText = `📎 ${lastMessage.attachment?.fileName || "Document"}`;
                    }
                    lastMessagePreview = { ...lastMessage.toObject(), message: previewText };
                }

                const unreadCount = await Message.countDocuments({
                    senderId: otherUser._id,
                    receiverId: userId,
                    status: { $ne: "seen" },
                    deletedFor: { $ne: userId },
                });

                return {
                    conversationId: conv._id,
                    user: otherUser,
                    lastMessage: lastMessagePreview,
                    unreadCount,
                    updatedAt: conv.updatedAt,
                };
            })
        );

        return res.status(200).json(results.filter(Boolean));
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const markConversationRead = async (req, res) => {
    try {
        const userId = req.id;
        const otherUserId = req.params.userId;

        const result = await Message.updateMany(
            { senderId: otherUserId, receiverId: userId, status: { $ne: "seen" } },
            { status: "seen" }
        );

        return res.status(200).json({ success: true, modifiedCount: result.modifiedCount });
    } catch (error) {
        console.error("Error marking conversation as read:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
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

const isParticipantOf = (targetMessage, userId) =>
    [targetMessage.senderId.toString(), targetMessage.receiverId.toString()].includes(userId);

export const editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { message } = req.body;
        const userId = req.id;

        const trimmed = (message || "").trim();
        if (!trimmed) {
            return res.status(400).json({ success: false, message: "Message cannot be empty" });
        }

        const targetMessage = await Message.findById(messageId);
        if (!targetMessage) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }
        if (targetMessage.senderId.toString() !== userId) {
            return res.status(403).json({ success: false, message: "You can only edit your own messages" });
        }
        if (targetMessage.isDeletedForEveryone) {
            return res.status(400).json({ success: false, message: "Cannot edit a deleted message" });
        }

        targetMessage.message = trimmed;
        targetMessage.edited = true;
        targetMessage.editedAt = new Date();
        await targetMessage.save();

        const io = req.app.get("io");
        const room = getChatRoomId(targetMessage.senderId, targetMessage.receiverId);
        io.to(room).emit("messageEdited", {
            _id: targetMessage._id,
            message: targetMessage.message,
            edited: true,
            editedAt: targetMessage.editedAt,
        });

        return res.status(200).json({ success: true, message: targetMessage });
    } catch (error) {
        console.error("Error editing message:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { forEveryone } = req.body;
        const userId = req.id;

        const targetMessage = await Message.findById(messageId);
        if (!targetMessage) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }
        if (!isParticipantOf(targetMessage, userId)) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        if (forEveryone) {
            if (targetMessage.senderId.toString() !== userId) {
                return res.status(403).json({ success: false, message: "Only the sender can delete for everyone" });
            }
            targetMessage.isDeletedForEveryone = true;
            targetMessage.deletedAt = new Date();
            await targetMessage.save();

            const io = req.app.get("io");
            const room = getChatRoomId(targetMessage.senderId, targetMessage.receiverId);
            io.to(room).emit("messageDeleted", { _id: targetMessage._id });
        } else {
            await Message.updateOne(
                { _id: messageId },
                { $addToSet: { deletedFor: userId } }
            );
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error deleting message:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const forwardMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { receiverIds } = req.body;
        const userId = req.id;

        if (!Array.isArray(receiverIds) || receiverIds.length === 0) {
            return res.status(400).json({ success: false, message: "Select at least one recipient" });
        }

        const sourceMessage = await Message.findById(messageId);
        if (!sourceMessage) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }
        if (!isParticipantOf(sourceMessage, userId)) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        const sender = await User.findById(userId);
        if (!sender) {
            return res.status(404).json({ success: false, message: "Sender not found" });
        }

        const io = req.app.get("io");
        const createdMessages = [];

        for (const receiverId of receiverIds) {
            let conversation = await Conversation.findOne({
                participants: { $all: [userId, receiverId] },
            });
            if (!conversation) {
                conversation = await Conversation.create({ participants: [userId, receiverId], messages: [] });
            }

            const forwardedMessage = await Message.create({
                senderId: userId,
                senderName: sender.fullName,
                receiverId,
                message: sourceMessage.message,
                messageType: sourceMessage.messageType,
                attachment: sourceMessage.attachment,
                isForwarded: true,
                status: "sent",
            });

            conversation.messages.push(forwardedMessage._id);
            await conversation.save();

            const room = getChatRoomId(userId, receiverId);
            io.to(room).emit("receiveMessage", forwardedMessage);

            createdMessages.push(forwardedMessage);
        }

        return res.status(201).json({ success: true, messages: createdMessages });
    } catch (error) {
        console.error("Error forwarding message:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const reactToMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.id;

        if (!emoji) {
            return res.status(400).json({ success: false, message: "Emoji is required" });
        }

        const targetMessage = await Message.findById(messageId);
        if (!targetMessage) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }
        if (!isParticipantOf(targetMessage, userId)) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        const existingIndex = targetMessage.reactions.findIndex((r) => r.userId.toString() === userId);
        const hadSameEmoji = existingIndex !== -1 && targetMessage.reactions[existingIndex].emoji === emoji;

        if (existingIndex !== -1) {
            targetMessage.reactions.splice(existingIndex, 1);
        }
        if (!hadSameEmoji) {
            targetMessage.reactions.push({ userId, emoji });
        }

        await targetMessage.save();

        const io = req.app.get("io");
        const room = getChatRoomId(targetMessage.senderId, targetMessage.receiverId);
        io.to(room).emit("messageReaction", { messageId: targetMessage._id, reactions: targetMessage.reactions });

        return res.status(200).json({ success: true, reactions: targetMessage.reactions });
    } catch (error) {
        console.error("Error reacting to message:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const pinMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.id;

        const targetMessage = await Message.findById(messageId);
        if (!targetMessage) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }
        if (!isParticipantOf(targetMessage, userId)) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        const pinnedCount = await Message.countDocuments({
            isPinned: true,
            $or: [
                { senderId: targetMessage.senderId, receiverId: targetMessage.receiverId },
                { senderId: targetMessage.receiverId, receiverId: targetMessage.senderId },
            ],
        });
        if (pinnedCount >= 3) {
            return res.status(400).json({ success: false, message: "Maximum of 3 pinned messages reached" });
        }

        targetMessage.isPinned = true;
        targetMessage.pinnedBy = userId;
        targetMessage.pinnedAt = new Date();
        await targetMessage.save();

        const io = req.app.get("io");
        const room = getChatRoomId(targetMessage.senderId, targetMessage.receiverId);
        io.to(room).emit("messagePinned", {
            messageId: targetMessage._id,
            isPinned: true,
            pinnedBy: targetMessage.pinnedBy,
            pinnedAt: targetMessage.pinnedAt,
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error pinning message:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const unpinMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.id;

        const targetMessage = await Message.findById(messageId);
        if (!targetMessage) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }
        if (!isParticipantOf(targetMessage, userId)) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        targetMessage.isPinned = false;
        targetMessage.pinnedBy = undefined;
        targetMessage.pinnedAt = undefined;
        await targetMessage.save();

        const io = req.app.get("io");
        const room = getChatRoomId(targetMessage.senderId, targetMessage.receiverId);
        io.to(room).emit("messageUnpinned", { messageId: targetMessage._id, isPinned: false });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error unpinning message:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const starMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.id;

        const targetMessage = await Message.findById(messageId);
        if (!targetMessage) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }
        if (!isParticipantOf(targetMessage, userId)) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        await Message.updateOne({ _id: messageId }, { $addToSet: { starredBy: userId } });
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error starring message:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const unstarMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.id;

        await Message.updateOne({ _id: messageId }, { $pull: { starredBy: userId } });
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error unstarring message:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getStarredMessages = async (req, res) => {
    try {
        const userId = req.id;
        const messages = await Message.find({ starredBy: userId }).sort({ createdAt: -1 });

        const results = await Promise.all(messages.map(async (msg) => {
            const otherUserId = msg.senderId.toString() === userId ? msg.receiverId : msg.senderId;
            const otherUser = await User.findById(otherUserId).select("fullName userName profileImage");
            return { message: msg, otherUser };
        }));

        return res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching starred messages:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
