import React, { useState, useEffect, useRef } from "react";
import { Col, Card, InputGroup, FormControl, Button, Container } from "react-bootstrap";
import { FaPaperPlane } from "react-icons/fa";
import { sendMessageApi } from "../Utils/api";
import socket from "../../socket.js";
import { v4 as uuidv4 } from "uuid";
import "./chat.css";
import { useDispatch, useSelector } from "react-redux";
import { setMessages, addMessage } from "../../redux/slices/chatSlice.js";

const ChatWindow = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const receiver = useSelector((state) => state.chat.receiver);
  const messages = useSelector((state) => state.chat.messages);

  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const lastTypingTime = useRef(null);

  useEffect(() => {
    if (!user?._id || !receiver?._id || !socket) return;

    const chatRoom = [user._id, receiver._id].sort().join("_");
    socket.emit("joinChat", chatRoom);

    // socket.emit("userOnline", user._id);

    const handleReceiveMessage = (message) => {
      if (!messages.some((msg) => msg._id === message._id)) {
        dispatch(addMessage([...messages, message]));
        // dispatch(addMessage(message));
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    socket.on("userTyping", ({ senderId }) => {
      if (senderId !== user._id) setTyping(true);
    });

    socket.on("userStoppedTyping", ({ senderId }) => {
      if (senderId !== user._id) setTyping(false);
    });

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [user, receiver, dispatch, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUserTyping = () => {
    const now = Date.now();
    if (!lastTypingTime.current || now - lastTypingTime.current > 1000) {
      socket.emit("typing", { senderId: user._id, receiverId: receiver._id });
      lastTypingTime.current = now;
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", { senderId: user._id, receiverId: receiver._id });
    }, 2000);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !receiver?._id) return;

    const tempId = `temp-${uuidv4()}`;
    const tempMessage = {
      _id: tempId,
      senderId: user._id,
      senderName: user.fullName,
      receiverId: receiver._id,
      receiverName: receiver.fullName,
      message: newMessage,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    dispatch(setMessages([...messages, tempMessage]));
    
    socket.emit("sendMessage", tempMessage);

    try {
      const response = await sendMessageApi(receiver._id, newMessage);
      if (response?._id) {
        const updatedMessages = messages.map((msg) =>
          msg._id === tempId ? { ...response, isRead: false } : msg
        );
        dispatch(setMessages(updatedMessages));
        socket.emit("messageSeen", {
          messageId: response._id,
          receiverId: receiver._id,
        });
      }
    } catch (error) {
      dispatch(setMessages(messages.filter((msg) => msg._id !== tempId)));
    }
    setNewMessage("");
  };

  return (
    <Col md={8} className="chat-container">
      <Card className="chat-card">
        <Card.Header className="chat-header">
          {receiver && receiver.fullName ? (
            <strong>{`Chat with ${receiver.fullName}`}</strong>
          ) : (
            "Select a user to chat"
          )}
        </Card.Header>

        <Card.Body className="chat-body">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`message-wrapper ${msg.senderId === user._id ? "sent" : "received"}`}
            >
              <Card className="message-bubble">
                <small className="message-sender">
                  {msg.senderId === user._id ? "You" : msg.senderName}
                </small>
                <div className="message-content">{msg.message}</div>
                <div className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {msg.senderId === user._id && (msg.isRead ? " ✔✔" : " ✔")}
                </div>
              </Card>
            </div>
          ))}
          {typing && <div className="typing-indicator">Typing...</div>}
          <div ref={messagesEndRef} />
        </Card.Body>
      </Card>

      <Container className="chat-input-container">
        <InputGroup className="chat-input">
          <FormControl
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleUserTyping();
            }}
          />
          <Button variant="primary" onClick={sendMessage}>
            <FaPaperPlane />
          </Button>
        </InputGroup>
      </Container>
    </Col>
  );
};

export default ChatWindow;


