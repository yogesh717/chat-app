import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderName: { type: String, required: true },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    status: { type: String, enum: ["sent", "delivered", "seen"], default: "sent" },

    messageType: { type: String, enum: ["text", "image", "video", "audio", "file"], default: "text" },
    attachment: {
      url: String,
      fileName: String,
      mimeType: String,
      size: Number,
    },

    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
    replyPreview: {
      messageId: mongoose.Schema.Types.ObjectId,
      senderId: mongoose.Schema.Types.ObjectId,
      senderName: String,
      message: String,
      messageType: String,
    },
    isForwarded: { type: Boolean, default: false },

    edited: { type: Boolean, default: false },
    editedAt: Date,

    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isDeletedForEveryone: { type: Boolean, default: false },
    deletedAt: Date,

    // 1:1 chat only — capped at 2 entries by construction (2 participants, one reaction per user).
    // Revisit if/when group chat reuses this schema.
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: String,
        reactedAt: { type: Date, default: Date.now },
      },
    ],

    isPinned: { type: Boolean, default: false },
    pinnedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    pinnedAt: Date,

    starredBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", MessageSchema);
