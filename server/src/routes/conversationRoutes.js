import express from "express";
import {
  createOrGetConversation,
  createGroupConversation,
  getUserConversations,
  getConversationById,
} from "../controllers/conversationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/private", protect, createOrGetConversation);
router.post("/group", protect, createGroupConversation);
router.get("/", protect, getUserConversations);
router.get("/:id", protect, getConversationById);

export default router;
