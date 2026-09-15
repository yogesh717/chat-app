import { Router } from "express";
import{
    sendMessage,
    getMessage,
    updateMessageStatus,
    getConversations,
    markConversationRead,
    editMessage,
    deleteMessage,
    forwardMessage,
    reactToMessage,
    pinMessage,
    unpinMessage,
    starMessage,
    unstarMessage,
    getStarredMessages,
}  from "../controllers/messageController.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import messageUpload from "../middleware/messageUpload.js";

const router = Router();


router.post("/send/:id", isAuthenticated, messageUpload.single("attachment"), sendMessage);

router.get("/conversations", isAuthenticated, getConversations);
router.put("/mark-read/:userId", isAuthenticated, markConversationRead);

router.get("/starred", isAuthenticated, getStarredMessages);

router.get("/get/:id", isAuthenticated, getMessage);
router.put("/update-status", isAuthenticated, updateMessageStatus);

router.put("/edit/:messageId", isAuthenticated, editMessage);
router.delete("/delete/:messageId", isAuthenticated, deleteMessage);
router.post("/forward/:messageId", isAuthenticated, forwardMessage);
router.post("/react/:messageId", isAuthenticated, reactToMessage);
router.put("/pin/:messageId", isAuthenticated, pinMessage);
router.put("/unpin/:messageId", isAuthenticated, unpinMessage);
router.put("/star/:messageId", isAuthenticated, starMessage);
router.put("/unstar/:messageId", isAuthenticated, unstarMessage);


export default router;
