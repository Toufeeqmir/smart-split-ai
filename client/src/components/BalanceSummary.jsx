import React, { useMemo } from "react";

const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

export default function BalanceSummary({ members = [], expenses = [] }) {
  const summary = useMemo(() => {
    const memberStats = {};

    members.forEach((member) => {
      memberStats[member] = {
        paid: 0,
        owes: 0,
      };
    });

    expenses.forEach((expense) => {
      const participants = expense.splitAmong?.length ? expense.splitAmong : [expense.paidBy];
      const share = Number(expense.amount || 0) / participants.length;

      if (!memberStats[expense.paidBy]) {
        memberStats[expense.paidBy] = { paid: 0, owes: 0 };
      }

      memberStats[expense.paidBy].paid += Number(expense.amount || 0);

      participants.forEach((participant) => {
        if (!memberStats[participant]) {
          memberStats[participant] = { paid: 0, owes: 0 };
        }

        memberStats[participant].owes += share;
      });
    });

    return Object.entries(memberStats).map(([name, stats]) => ({
      name,
      paid: stats.paid,
      owes: stats.owes,
      net: stats.paid - stats.owes,
    }));
  }, [expenses, members]);

  if (summary.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {summary.map((member) => (
        <div
          key={member.name}
          className="panel relative overflow-hidden p-5"
        >
          <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-brand-teal/10 blur-2xl" />

          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="soft-label">Member snapshot</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {member.name}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  member.net >= 0
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {member.net >= 0 ? "Positive balance" : "Needs settlement"}
              </span>
            </div>

            <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="soft-label">Paid</p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {formatCurrency(member.paid)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="soft-label">Share</p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {formatCurrency(member.owes)}
                </p>
              </div>
            </div>

            <h2
              className={`mt-5 text-xl font-semibold ${
                member.net >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {member.net >= 0 ? "Gets back" : "Owes"}{" "}
              {formatCurrency(Math.abs(member.net))}
            </h2>
          </div>
        </div>
      ))}
    </div>
  );
}
