import express from "express";
import {createGroup , getGroups} from "../controllers/groupController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect , createGroup);
router.get("/", protect , getGroups);

export default router;