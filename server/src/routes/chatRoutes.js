import express from "express";

import {sendMessage , getMessages, markConversationSeen}  from "../controllers/chatController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect , sendMessage);
router.get("/", protect, getMessages);
router.get("/:conversationId", protect, getMessages);
router.post("/:conversationId/seen", protect, markConversationSeen);

export default router;
