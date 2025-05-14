import { Router } from "express";
import{sendMessage,getMessage,updateMessageStatus}  from "../controllers/messageController.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = Router();
 

router.post("/send/:id", isAuthenticated, sendMessage);

router.get("/get/:id", isAuthenticated, getMessage); 
router.put("/update-status", isAuthenticated, updateMessageStatus);




export default router;