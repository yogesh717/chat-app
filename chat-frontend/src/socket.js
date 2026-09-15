// src/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket"],
    auth: (cb) => cb({ token: localStorage.getItem("token") }),
  });



export default socket;
