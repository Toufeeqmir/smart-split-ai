 import express from "express";
 import {register, login, getMe, listUsers, updateMe} from "../controllers/authController.js";

import {protect } from "../middlewares/authMiddleware.js"
 const router = express.Router();

 //Register
 router.post("/register", register);

 //login

 router.post("/login", login);

 //Get current user(protected)

 router.get("/me",protect ,  getMe);
 router.patch("/me", protect, updateMe);
 router.get("/users", protect, listUsers);

 export default router;
