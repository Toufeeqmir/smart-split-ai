
// expenseController
import Expense from "../models/Expense.js";

export const addExpense = async(req , res) =>{
     try{
        const expense = new Expense(req.body);
        await expense.save();
        res.status(201).json(expense);
     }catch(err){
        res.status(500).json({error:err.message});
     }

};
export const getExpenses = async (req, res) =>{
    try{
        const expenses = (await Expense.find()).toSorted({createdAt: -1});
        res.json(expenses);
    }catch(err){
        res.status(500).json({error: err.message});
    }
};
