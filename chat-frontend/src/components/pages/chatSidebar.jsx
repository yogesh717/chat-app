import React, { useState, useEffect } from "react";
import { Col, ListGroup, Badge } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { fetchUsersApi } from "../Utils/api";
import constant from "../Utils/constant";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { setReceiver } from "../../redux/slices/chatSlice.js";
import "./chat.css";



const ChatSidebar = () => {
  // const [users, setUsers] = useState([]);

  
  // const [userStatus, setUserStatus] = useState({}); // Store online/offline status
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  // const receiver = useSelector((state) => state.chat.receiver);

  const [users, setUsers] = useState([]);
  const [userStatus, setUserStatus] = useState({});

  useEffect(() => {
    if (!user || !user._id) {  
        console.warn("User not found yet, waiting...");
        return;
    }
  
    const newSocket = io("http://localhost:5000");
  
    newSocket.emit("userOnline", user._id);
  
    newSocket.on("updateUserStatus", ({ userId, status }) => {
        setUserStatus((prev) => ({ ...prev, [userId]: status }));
    });
  
    return () => {
        newSocket.disconnect();
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

  return (
    <Col md={4} className="chat-sidebar border-end ">
      <h5 className=" text-center chatSiebar-header">Chats</h5>
      <ListGroup variant="flush">
        {users.map((u) => (
          <ListGroup.Item  
            key={u._id}
            action
            className={`d-flex align-items-center justify-content-between p-3 ${
              userStatus[u._id] === "online" ? "bg-success text-white" : ""
            }`}
              
            onClick={() => dispatch(setReceiver(u))}
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
    </Col>
  );
};



export default ChatSidebar;
