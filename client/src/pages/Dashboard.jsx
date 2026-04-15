import React, { useState } from "react";
import BalanceSummary from "../components/BalanceSummary";
import ExpenseCard from "../components/ExpenseCard";
import Button from "../components/Button";

export default function Dashboard() {
  const members = ["You", "A", "B"];

  const [expenses, setExpenses] = useState([]);

  const [form, setForm] = useState({
    description: "",
    amount: "",
    paidBy: "You",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addExpense = () => {
    if (!form.description || !form.amount) return;

    const newExpense = {
      id: Date.now(),
      description: form.description,
      amount: Number(form.amount),
      paidBy: form.paidBy,
    };

    setExpenses([newExpense, ...expenses]);

    setForm({
      description: "",
      amount: "",
      paidBy: "You",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">
        Dashboard
      </h2>

      {/* Balance Summary */}
      <BalanceSummary members={members} expenses={expenses} />

      {/* Add Expense Form */}
      <div className="bg-white p-4 rounded-lg shadow border space-y-3">
        <h3 className="font-semibold text-gray-800">Add Expense</h3>

        <input
          type="text"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="number"
          name="amount"
          placeholder="Amount (₹)"
          value={form.amount}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <select
          name="paidBy"
          value={form.paidBy}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        >
          {members.map((member) => (
            <option key={member} value={member}>
              {member}
            </option>
          ))}
        </select>

        <Button text="Add Expense" onClick={addExpense} type="primary" />
      </div>

      {/* Expense List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800">Recent Expenses</h3>
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-white rounded-lg border">
            <p className="text-lg">No expenses yet</p>
            <p className="text-sm">Add your first expense above</p>
          </div>
        ) : (
          expenses.map((exp) => (
            <ExpenseCard key={exp.id} expense={exp} />
          ))
        )}
      </div>
    </div>
  );
}