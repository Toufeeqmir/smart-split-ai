import React from "react";

export default function ExpenseCard({ expense }) {
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
      
      <div>
        <h3 className="font-semibold text-gray-800">
          {expense.description}
        </h3>
        <p className="text-sm text-gray-500">
          Paid by {expense.paidBy}
        </p>
      </div>

      <div className="text-right">
        <p className="font-bold text-gray-800">
          ₹{expense.amount}
        </p>
      </div>

    </div>
  );
}