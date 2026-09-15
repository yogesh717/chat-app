
import React, {  useEffect } from "react";
import { Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import ChatSidebar from "./chatSidebar";
import ChatWindow from "./chatWindow";
import { getMessageApi, getConversationsApi, markConversationReadApi } from "../Utils/api";
import socket from "../../socket.js";
import { useDispatch, useSelector } from "react-redux";
import {
  setMessages,
  addMessage,
  setConversations,
  upsertConversation,
  markMessageEdited,
  markMessageDeleted,
  setMessageReactions,
  setMessagePinned,
} from "../../redux/slices/chatSlice.js";

// import { io } from "socket.io-client";
import "./chat.css";

// const socket = io("http://localhost:5000"); // Replace with your backend URL

const Chat = () => {
  

  const dispatch = useDispatch();

  // Get Redux states
  const user = useSelector((state) => state.auth.user);
  const receiver = useSelector((state) => state.chat.receiver);
  const messages = useSelector((state) => state.chat.messages);


   // On first load, emit user online status
   useEffect(() => {
    if (!user?._id) return;
    socket.emit("userOnline");
  }, [user]);

  // Load the conversation list (last message, timestamps, unread counts)
  useEffect(() => {
    if (!user?._id) return;

    const fetchConversations = async () => {
      try {
        const data = await getConversationsApi();
        dispatch(setConversations(Array.isArray(data) ? data : []));
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, [user, dispatch]);


  useEffect(() => {
    if (!receiver?._id) return;

    const fetchMessages = async () => {
      try {
        const data = await getMessageApi(receiver._id);
        dispatch(setMessages(Array.isArray(data) ? data : []));
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [receiver, dispatch]);

   // Listen for real-time incoming messages
   useEffect(() => {
    if (!user) return;

    const handleReceiveMessage = (newMessage) => {
      const belongsToOpenConversation =
        (newMessage.senderId === receiver?._id && newMessage.receiverId === user._id) ||
        (newMessage.senderId === user._id && newMessage.receiverId === receiver?._id);

      if (belongsToOpenConversation) {
        dispatch(addMessage(newMessage));
        // Already viewing this conversation — keep the server's unread count in sync too.
        if (newMessage.receiverId === user._id) {
          markConversationReadApi(newMessage.senderId);
        }
      }

      // Update the conversation list regardless of which conversation is open,
      // so the sidebar reflects new messages/unread counts in real time.
      if (newMessage.receiverId === user._id) {
        dispatch(
          upsertConversation({
            otherUserId: newMessage.senderId,
            otherUserInfo: { _id: newMessage.senderId, fullName: newMessage.senderName },
            lastMessage: newMessage,
            incoming: newMessage.senderId !== receiver?._id,
          })
        );
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    const handleMessageEdited = ({ _id, message, editedAt }) => {
      dispatch(markMessageEdited({ messageId: _id, message, editedAt }));
    };
    const handleMessageDeleted = ({ _id }) => {
      dispatch(markMessageDeleted({ messageId: _id, forEveryone: true }));
    };
    const handleMessageReaction = ({ messageId, reactions }) => {
      dispatch(setMessageReactions({ messageId, reactions }));
    };
    const handleMessagePinned = ({ messageId, isPinned, pinnedBy, pinnedAt }) => {
      dispatch(setMessagePinned({ messageId, isPinned, pinnedBy, pinnedAt }));
    };
    const handleMessageUnpinned = ({ messageId }) => {
      dispatch(setMessagePinned({ messageId, isPinned: false, pinnedBy: null, pinnedAt: null }));
    };

    socket.on("messageEdited", handleMessageEdited);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("messageReaction", handleMessageReaction);
    socket.on("messagePinned", handleMessagePinned);
    socket.on("messageUnpinned", handleMessageUnpinned);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageEdited", handleMessageEdited);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("messageReaction", handleMessageReaction);
      socket.off("messagePinned", handleMessagePinned);
      socket.off("messageUnpinned", handleMessageUnpinned);
    };
  }, [user, receiver, dispatch]);

  if (!user) {
    return (
      <div className="text-center mt-5">
        Please log in to access the chat.
      </div>
    );
  }


   return (
    <Container fluid className=" chat-page d-flex">
      <div className={`chat-main d-flex ${receiver ? "conversation-open" : ""}`}>
      <div className="chat-sidebar-container">
      <ChatSidebar />
      </div>
      <div className="chat-window-container">
      <ChatWindow messages={messages} socket={socket} />
      </div>
        </div>
    </Container>
  );
};
 

export default Chat;










