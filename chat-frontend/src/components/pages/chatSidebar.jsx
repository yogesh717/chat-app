import React, { useState, useEffect } from "react";
import { Col, ListGroup, Badge } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { fetchUsersApi, markConversationReadApi } from "../Utils/api";
import constant from "../Utils/constant";
import socket from "../../socket";
import { useDispatch, useSelector } from "react-redux";
import { setReceiver, resetUnreadForConversation } from "../../redux/slices/chatSlice.js";
import "./chat.css";

const formatTimestamp = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatSidebar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const receiver = useSelector((state) => state.chat.receiver);
  const conversations = useSelector((state) => state.chat.conversations);

  const [users, setUsers] = useState([]);
  const [userStatus, setUserStatus] = useState({});

  useEffect(() => {
    if (!user || !user._id) {
        console.warn("User not found yet, waiting...");
        return;
    }

    socket.emit("userOnline");

    const handleStatus = ({ userId, status }) => {
        setUserStatus((prev) => ({ ...prev, [userId]: status }));
    };
    socket.on("updateUserStatus", handleStatus);

    return () => {
        socket.off("updateUserStatus", handleStatus);
    };
  }, [user]);



  useEffect(() => {
    const loadUsers = async () => {
        try {
            console.log("🔹 Fetching users from API...");
            const usersData = await fetchUsersApi(constant.fetchAllUrl);

            if (!Array.isArray(usersData)) {
                throw new Error("Invalid data format received");
            }

            setUsers(usersData.filter((u) => u._id !== user._id));
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    loadUsers();
  }, [user]);

  const sortedConversations = [...conversations].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );
  const conversationUserIds = new Set(sortedConversations.map((c) => c.user?._id));
  const usersWithoutConversation = users.filter((u) => !conversationUserIds.has(u._id));

  const openConversation = (otherUser) => {
    dispatch(setReceiver(otherUser));
    dispatch(resetUnreadForConversation(otherUser._id));
    markConversationReadApi(otherUser._id);
  };

  return (
    <Col md={4} className="chat-sidebar border-end ">
      <h5 className=" text-center chatSiebar-header">Chats</h5>
      <ListGroup variant="flush">
        {sortedConversations.map((conv) => (
          <ListGroup.Item
            key={conv.user._id}
            action
            active={receiver?._id === conv.user._id}
            className={`d-flex align-items-center justify-content-between p-3 chat-list-item ${
              userStatus[conv.user._id] === "online" ? "bg-success text-white" : ""
            }`}
            onClick={() => openConversation(conv.user)}
          >
            <div className="d-flex align-items-center chat-list-item-main">
              <FaUserCircle size={24} className="me-2 text-primary flex-shrink-0" />
              <div className="chat-list-item-text">
                <div className="chat-list-item-name">{conv.user.fullName}</div>
                {conv.lastMessage && (
                  <div className="chat-list-item-preview">{conv.lastMessage.message}</div>
                )}
              </div>
            </div>
            <div className="d-flex flex-column align-items-end chat-list-item-meta">
              {conv.lastMessage && (
                <small className="chat-list-item-time">
                  {formatTimestamp(conv.lastMessage.createdAt)}
                </small>
              )}
              {conv.unreadCount > 0 && (
                <Badge bg="danger" pill className="mt-1">
                  {conv.unreadCount}
                </Badge>
              )}
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>

      {usersWithoutConversation.length > 0 && (
        <>
          <h6 className="text-center text-muted mt-3">Start a new chat</h6>
          <ListGroup variant="flush">
            {usersWithoutConversation.map((u) => (
              <ListGroup.Item
                key={u._id}
                action
                active={receiver?._id === u._id}
                className={`d-flex align-items-center justify-content-between p-3 ${
                  userStatus[u._id] === "online" ? "bg-success text-white" : ""
                }`}
                onClick={() => openConversation(u)}
              >
                <div className="d-flex align-items-center">
                  <FaUserCircle size={24} className="me-2 text-primary" />
                  <span>{u.fullName}</span>
                </div>
                <Badge bg={userStatus[u._id] === "online" ? "success" : "secondary"}>
                  {userStatus[u._id] === "online" ? "Online" : "Offline"}
                </Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </>
      )}
    </Col>
  );
};



export default ChatSidebar;
