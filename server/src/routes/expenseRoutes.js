import express from "express";
import {protect} from "../middlewares/authMiddleware.js";
import {
  addExpense,
  getExpenses,
  getBalances,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";
const router = express.Router();

router.post("/", protect ,addExpense);
router.get("/",protect, getExpenses);
router.get("/balances",protect,  getBalances);
router.put("/:id", protect, updateExpense);
router.delete("/:id", protect, deleteExpense);


export default router;
