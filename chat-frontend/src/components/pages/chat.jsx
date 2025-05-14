
import React, {  useEffect } from "react";
import { Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import ChatSidebar from "./chatSidebar";
import ChatWindow from "./chatWindow";
import Sidebar from "../layout/Sidebar";
import { getMessageApi } from "../Utils/api";
import socket from "../../socket.js";
import { useDispatch, useSelector } from "react-redux";
import { setMessages, addMessage,} from "../../redux/slices/chatSlice.js";

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
    socket.emit("userOnline", user._id);
  }, [user]);


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
      if (
        newMessage.senderId === receiver?._id ||
        newMessage.receiverId === user._id
      ) {
        dispatch(addMessage(newMessage));
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    // Listen for new messages
    // socket.on("receiveMessage", (newMessage) => {
    //   if (newMessage.senderId === receiver?._id || newMessage.receiverId === user._id) {
    //     setMessages((prev) => [...prev, newMessage]);
    //   }
    // });

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
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
      <Sidebar />
      <div className="chat-main d-flex">
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










