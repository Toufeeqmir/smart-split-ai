import React from "react";

export default function BalanceSummary({members = [] , expenses = []}){
  const getMemberTotal = (name) => 
    expenses.filter(e => e.paidBy === name)
            .reduce((sum , e) => sum + e.amount ,0);

  return (                    // ← return is inside
    <div className="grid grid-cols-3 gap-4">
      {members.map((member)=>(
        <div key={member} className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500 font-medium">{member}</p>
          <p className="text-sm text-gray-500">Spent</p>
          <h2 className="text-xl font-bold text-gray-800">₹{getMemberTotal(member)}</h2>
        </div>
      ))}
    </div>
  );
}                           