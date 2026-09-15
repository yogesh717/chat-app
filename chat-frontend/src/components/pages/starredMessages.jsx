import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Container, ListGroup, Button } from "react-bootstrap";
import { FaStar, FaFile } from "react-icons/fa";
import { getStarredMessagesApi, unstarMessageApi } from "../Utils/api";
import { setReceiver } from "../../redux/slices/chatSlice.js";
import "./chat.css";

const previewFor = (message) => {
  if (message.isDeletedForEveryone) return "This message was deleted";
  if (message.messageType === "image") return "📷 Photo";
  if (message.messageType === "video") return "🎥 Video";
  if (message.messageType === "audio") return "🎤 Audio";
  if (message.messageType === "file") return `📎 ${message.attachment?.fileName || "Document"}`;
  return message.message;
};

const StarredMessages = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await getStarredMessagesApi();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnstar = async (messageId) => {
    const response = await unstarMessageApi(messageId);
    if (response?.success) {
      setItems((prev) => prev.filter((item) => item.message._id !== messageId));
    }
  };

  const handleJump = (otherUser) => {
    dispatch(setReceiver(otherUser));
    navigate("/chat");
  };

  return (
    <>
      <Container fluid className="p-4">
        <h3 className="fw-bold mb-4">
          <FaStar className="text-warning me-2" />
          Starred Messages
        </h3>

        {loading && <p className="text-muted">Loading…</p>}
        {!loading && items.length === 0 && <p className="text-muted">No starred messages yet.</p>}

        <ListGroup>
          {items.map(({ message, otherUser }) => (
            <ListGroup.Item
              key={message._id}
              className="d-flex justify-content-between align-items-start"
            >
              <div
                style={{ cursor: "pointer" }}
                className="flex-grow-1"
                onClick={() => handleJump(otherUser)}
              >
                <div className="fw-semibold">
                  {message.senderId === user?._id ? "You" : message.senderName}
                  {" "}
                  <small className="text-muted">
                    with {otherUser?.fullName || "Unknown user"}
                  </small>
                </div>
                <div className="text-muted d-flex align-items-center gap-1">
                  {message.messageType === "file" && <FaFile size={12} />}
                  {previewFor(message)}
                </div>
                <small className="text-muted">
                  {new Date(message.createdAt).toLocaleString()}
                </small>
              </div>
              <Button variant="outline-secondary" size="sm" onClick={() => handleUnstar(message._id)}>
                Unstar
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Container>
    </>
  );
};

export default StarredMessages;
