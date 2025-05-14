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
      required: true,  
    },
    status: { type: String, enum: ["sent", "delivered", "seen"], default: "sent" },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true } 
);

// export const Message = mongoose.model("Message", messageSchema);
export const Message = mongoose.model("Message", MessageSchema);