import express from "express";
import {addExpense, getExpenses} from "../controllers/expenseController.js";
const router = express.Router();

router.post("/", addExpense);
router.get("/", getExpenses);
export default router;