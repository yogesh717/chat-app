import React, { useState, useEffect, useRef } from "react";
import { Col, Card, InputGroup, FormControl, Button, Container, Dropdown, Overlay, Popover } from "react-bootstrap";
import { FaPaperPlane, FaPaperclip, FaSmile, FaThumbtack, FaStar, FaFile, FaTimes } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import {
  sendMessageApi,
  editMessageApi,
  deleteMessageApi,
  forwardMessageApi,
  reactToMessageApi,
  pinMessageApi,
  unpinMessageApi,
  starMessageApi,
  unstarMessageApi,
} from "../Utils/api";
import socket from "../../socket.js";
import "./chat.css";
import { useDispatch, useSelector } from "react-redux";
import {
  setMessages,
  upsertConversation,
  setReceiver,
  markMessageEdited,
  markMessageDeleted,
  setMessageReactions,
  setMessagePinned,
  toggleMessageStarred,
} from "../../redux/slices/chatSlice.js";
import ForwardModal from "./ForwardModal";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡", "👏", "🔥"];

const isTempMessage = (id) => typeof id === "string" && id.startsWith("temp-");

const formatFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ChatWindow = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const receiver = useSelector((state) => state.chat.receiver);
  const messages = useSelector((state) => state.chat.messages);

  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactionPickerFor, setReactionPickerFor] = useState(null);
  const [forwardMessageId, setForwardMessageId] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const lastTypingTime = useRef(null);
  const fileInputRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const messageRefs = useRef({});

  useEffect(() => {
    if (!user?._id || !receiver?._id || !socket) return;

    const chatRoom = [user._id, receiver._id].sort().join("_");
    socket.emit("joinChat", chatRoom);

    // Incoming messages are handled centrally in chat.jsx (which filters by
    // conversation and updates the same Redux state this component reads) —
    // no need for a second receiveMessage listener here.

    const handleIncomingTyping = ({ senderId }) => {
      if (senderId !== user._id) setTyping(true);
    };
    const handleIncomingStopTyping = ({ senderId }) => {
      if (senderId !== user._id) setTyping(false);
    };

    socket.on("userTyping", handleIncomingTyping);
    socket.on("userStoppedTyping", handleIncomingStopTyping);

    return () => {
      socket.off("userTyping", handleIncomingTyping);
      socket.off("userStoppedTyping", handleIncomingStopTyping);
    };
  }, [user, receiver]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset composer state when switching conversations.
  useEffect(() => {
    setReplyingTo(null);
    setEditingMessage(null);
    clearAttachment();
    setNewMessage("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiver?._id]);

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

  const clearAttachment = () => {
    if (attachmentPreviewUrl) URL.revokeObjectURL(attachmentPreviewUrl);
    setAttachmentFile(null);
    setAttachmentPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAttachmentFile(file);
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      setAttachmentPreviewUrl(URL.createObjectURL(file));
    } else {
      setAttachmentPreviewUrl(null);
    }
  };

  const sendMessage = async () => {
    if (editingMessage) {
      return handleSaveEdit();
    }

    if (!newMessage.trim() && !attachmentFile) return;
    if (!receiver?._id) return;

    const tempId = `temp-${crypto.randomUUID()}`;
    const tempMessage = {
      _id: tempId,
      senderId: user._id,
      senderName: user.fullName,
      receiverId: receiver._id,
      receiverName: receiver.fullName,
      message: newMessage,
      createdAt: new Date().toISOString(),
      isRead: false,
      replyPreview: replyingTo
        ? {
            messageId: replyingTo._id,
            senderName: replyingTo.senderName,
            message: replyingTo.message,
            messageType: replyingTo.messageType,
          }
        : undefined,
    };

    dispatch(setMessages([...messages, tempMessage]));

    if (!attachmentFile) {
      // Media messages need the server-generated URL first, so only relay
      // the lightweight text case optimistically over the socket.
      socket.emit("sendMessage", tempMessage);
    }

    const replyToId = replyingTo?._id;
    const fileToSend = attachmentFile;
    setReplyingTo(null);
    clearAttachment();
    setNewMessage("");

    try {
      const response = await sendMessageApi(receiver._id, newMessage, {
        replyTo: replyToId,
        attachmentFile: fileToSend,
      });
      if (response?._id) {
        dispatch(
          setMessages(
            messages
              .filter((msg) => msg._id !== tempId)
              .concat({ ...response, isRead: false })
          )
        );
        dispatch(
          upsertConversation({
            otherUserId: receiver._id,
            otherUserInfo: receiver,
            lastMessage: response,
            incoming: false,
          })
        );
        if (fileToSend) {
          // Media messages weren't relayed optimistically above — broadcast now that we have the real doc.
          socket.emit("sendMessage", response);
        }
        socket.emit("messageSeen", {
          messageId: response._id,
          receiverId: receiver._id,
        });
      }
    } catch (error) {
      dispatch(setMessages(messages.filter((msg) => msg._id !== tempId)));
    }
  };

  const handleReply = (msg) => {
    setEditingMessage(null);
    setReplyingTo({
      _id: msg._id,
      senderName: msg.senderId === user._id ? "You" : msg.senderName,
      message: msg.isDeletedForEveryone ? "This message was deleted" : msg.message,
      messageType: msg.messageType,
    });
  };

  const handleStartEdit = (msg) => {
    setReplyingTo(null);
    setEditingMessage({ _id: msg._id });
    setNewMessage(msg.message);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setNewMessage("");
  };

  const handleSaveEdit = async () => {
    if (!newMessage.trim() || !editingMessage) return;
    const response = await editMessageApi(editingMessage._id, newMessage.trim());
    if (response?.success) {
      dispatch(markMessageEdited({
        messageId: editingMessage._id,
        message: response.message.message,
        editedAt: response.message.editedAt,
      }));
    }
    setEditingMessage(null);
    setNewMessage("");
  };

  const handleDelete = async (msg, forEveryone) => {
    const response = await deleteMessageApi(msg._id, forEveryone);
    if (response?.success) {
      dispatch(markMessageDeleted({ messageId: msg._id, forEveryone }));
    }
  };

  const handleReact = async (messageId, emoji) => {
    setReactionPickerFor(null);
    const response = await reactToMessageApi(messageId, emoji);
    if (response?.success) {
      dispatch(setMessageReactions({ messageId, reactions: response.reactions }));
    }
  };

  const handleTogglePin = async (msg) => {
    if (msg.isPinned) {
      const response = await unpinMessageApi(msg._id);
      if (response?.success) {
        dispatch(setMessagePinned({ messageId: msg._id, isPinned: false, pinnedBy: null, pinnedAt: null }));
      }
    } else {
      const response = await pinMessageApi(msg._id);
      if (response?.success) {
        dispatch(setMessagePinned({ messageId: msg._id, isPinned: true, pinnedBy: user._id, pinnedAt: new Date().toISOString() }));
      } else {
        alert(response?.message || "Could not pin message");
      }
    }
  };

  const handleToggleStar = async (msg) => {
    const isStarred = msg.starredBy?.includes(user._id);
    const response = isStarred ? await unstarMessageApi(msg._id) : await starMessageApi(msg._id);
    if (response?.success) {
      dispatch(toggleMessageStarred({ messageId: msg._id, userId: user._id, starred: !isStarred }));
    }
  };

  const handleForward = async (receiverIds) => {
    const response = await forwardMessageApi(forwardMessageId, receiverIds);
    setForwardMessageId(null);
    if (!response?.success) {
      alert(response?.message || "Could not forward message");
    }
  };

  const scrollToMessage = (messageId) => {
    const el = messageRefs.current[messageId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("message-highlight");
      setTimeout(() => el.classList.remove("message-highlight"), 1500);
    }
  };

  const onEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  const pinnedMessages = messages.filter((m) => m.isPinned);

  const renderAttachment = (msg) => {
    if (!msg.attachment) return null;
    const { url, fileName, size } = msg.attachment;
    if (msg.messageType === "image") {
      return <img src={url} alt={fileName || "attachment"} className="message-attachment-image" />;
    }
    if (msg.messageType === "video") {
      return <video src={url} controls className="message-attachment-video" />;
    }
    if (msg.messageType === "audio") {
      return <audio src={url} controls className="message-attachment-audio" />;
    }
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="attachment-card">
        <FaFile className="me-2" />
        <span className="attachment-card-name">{fileName}</span>
        <span className="attachment-card-size">{formatFileSize(size)}</span>
      </a>
    );
  };

  return (
    <Col md={8} className="chat-container">
      <Card className="chat-card">
        <Card.Header className="chat-header">
          <button
            type="button"
            className="chat-back-btn"
            aria-label="Back to conversations"
            onClick={() => dispatch(setReceiver(null))}
          >
            &larr;
          </button>
          {receiver && receiver.fullName ? (
            <strong>{`Chat with ${receiver.fullName}`}</strong>
          ) : (
            "Select a user to chat"
          )}
        </Card.Header>

        {pinnedMessages.length > 0 && (
          <div className="pinned-messages-bar">
            <FaThumbtack className="me-2" />
            {pinnedMessages.map((m) => (
              <span
                key={m._id}
                className="pinned-message-chip"
                onClick={() => scrollToMessage(m._id)}
              >
                {m.message?.slice(0, 40) || "Pinned message"}
              </span>
            ))}
          </div>
        )}

        <Card.Body className="chat-body">
          {messages.map((msg) => {
            const mine = msg.senderId === user._id;
            const disabledActions = isTempMessage(msg._id) || msg.isDeletedForEveryone;
            const isStarred = msg.starredBy?.includes(user._id);

            return (
              <div
                key={msg._id}
                ref={(el) => { messageRefs.current[msg._id] = el; }}
                className={`message-wrapper ${mine ? "sent" : "received"}`}
              >
                <Card className="message-bubble">
                  <div className="message-bubble-top">
                    <small className="message-sender">{mine ? "You" : msg.senderName}</small>
                    {!disabledActions && (
                      <div className="message-actions">
                        <button
                          type="button"
                          className="message-action-icon-btn"
                          onClick={(e) => setReactionPickerFor({ id: msg._id, target: e.target })}
                          aria-label="React"
                        >
                          😊
                        </button>
                        <Dropdown align="end">
                          <Dropdown.Toggle as="button" className="message-action-icon-btn message-action-toggle">
                            ⋯
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleReply(msg)}>Reply</Dropdown.Item>
                            <Dropdown.Item onClick={() => setForwardMessageId(msg._id)}>Forward</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleToggleStar(msg)}>
                              {isStarred ? "Unstar" : "Star"}
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleTogglePin(msg)}>
                              {msg.isPinned ? "Unpin" : "Pin"}
                            </Dropdown.Item>
                            {mine && msg.messageType === "text" && (
                              <Dropdown.Item onClick={() => handleStartEdit(msg)}>Edit</Dropdown.Item>
                            )}
                            {mine && (
                              <Dropdown.Item className="text-danger" onClick={() => handleDelete(msg, true)}>
                                Delete for everyone
                              </Dropdown.Item>
                            )}
                            <Dropdown.Item className="text-danger" onClick={() => handleDelete(msg, false)}>
                              Delete for me
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    )}
                  </div>

                  {msg.isForwarded && <div className="forwarded-label">Forwarded</div>}

                  {msg.replyPreview && (
                    <div className="reply-quote" onClick={() => scrollToMessage(msg.replyPreview.messageId)}>
                      <div className="reply-quote-sender">{msg.replyPreview.senderName}</div>
                      <div className="reply-quote-text">{msg.replyPreview.message}</div>
                    </div>
                  )}

                  {msg.isDeletedForEveryone ? (
                    <div className="message-content message-deleted">
                      <em>This message was deleted</em>
                    </div>
                  ) : (
                    <>
                      {renderAttachment(msg)}
                      {msg.message && <div className="message-content">{msg.message}</div>}
                    </>
                  )}

                  {msg.reactions?.length > 0 && (
                    <div className="reaction-pills">
                      {Object.entries(
                        msg.reactions.reduce((acc, r) => {
                          acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([emoji, count]) => (
                        <span key={emoji} className="reaction-pill">
                          {emoji} {count}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="message-time">
                    {isStarred && <FaStar className="star-indicator" />}
                    {msg.edited && !msg.isDeletedForEveryone && <span className="edited-tag">Edited</span>}
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {mine && (msg.isRead ? " ✔✔" : " ✔")}
                  </div>
                </Card>
              </div>
            );
          })}
          {typing && <div className="typing-indicator">Typing...</div>}
          <div ref={messagesEndRef} />
        </Card.Body>
      </Card>

      {reactionPickerFor && (
        <Overlay
          show
          target={reactionPickerFor.target}
          placement="top"
          rootClose
          onHide={() => setReactionPickerFor(null)}
        >
          <Popover id="reaction-popover">
            <Popover.Body className="reaction-picker-popover">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="reaction-picker-emoji"
                  onClick={() => handleReact(reactionPickerFor.id, emoji)}
                >
                  {emoji}
                </button>
              ))}
            </Popover.Body>
          </Popover>
        </Overlay>
      )}

      {(replyingTo || editingMessage) && (
        <div className="composer-banner">
          <div>
            <strong>{editingMessage ? "Editing message" : `Replying to ${replyingTo.senderName}`}</strong>
            {replyingTo && <div className="composer-banner-preview">{replyingTo.message}</div>}
          </div>
          <button
            type="button"
            className="composer-banner-close"
            onClick={editingMessage ? handleCancelEdit : () => setReplyingTo(null)}
          >
            <FaTimes />
          </button>
        </div>
      )}

      {attachmentFile && (
        <div className="attachment-preview-panel">
          {attachmentPreviewUrl && attachmentFile.type.startsWith("image/") && (
            <img src={attachmentPreviewUrl} alt="preview" className="attachment-preview-image" />
          )}
          {attachmentPreviewUrl && attachmentFile.type.startsWith("video/") && (
            <video src={attachmentPreviewUrl} className="attachment-preview-image" muted />
          )}
          {!attachmentPreviewUrl && (
            <div className="attachment-card">
              <FaFile className="me-2" />
              <span className="attachment-card-name">{attachmentFile.name}</span>
              <span className="attachment-card-size">{formatFileSize(attachmentFile.size)}</span>
            </div>
          )}
          <button type="button" className="composer-banner-close" onClick={clearAttachment}>
            <FaTimes />
          </button>
        </div>
      )}

      <Container className="chat-input-container">
        <InputGroup className="chat-input">
          <Button
            variant="light"
            className="composer-icon-btn"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach file"
          >
            <FaPaperclip />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="d-none"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
            onChange={handleFileSelect}
          />
          <Button
            variant="light"
            className="composer-icon-btn"
            ref={emojiButtonRef}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            aria-label="Emoji"
          >
            <FaSmile />
          </Button>
          <FormControl
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleUserTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button variant="primary" onClick={sendMessage}>
            <FaPaperPlane />
          </Button>
        </InputGroup>
        {showEmojiPicker && (
          <div className="emoji-picker-popover">
            <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={350} />
          </div>
        )}
      </Container>

      <ForwardModal
        show={!!forwardMessageId}
        onClose={() => setForwardMessageId(null)}
        onForward={handleForward}
      />
    </Col>
  );
};

export default ChatWindow;
