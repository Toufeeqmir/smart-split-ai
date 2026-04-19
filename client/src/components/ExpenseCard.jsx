import React from "react";

const formatCurrency = (amount) => `Rs ${Number(amount || 0).toFixed(2)}`;

export default function ExpenseCard({
  expense,
  currentUser,
  onEdit,
  onDelete,
}) {
  const canManage =
    expense.createdBy === currentUser || expense.paidBy === currentUser;
  const perPersonShare =
    expense.splitAmong?.length > 0
      ? Number(expense.amount || 0) / expense.splitAmong.length
      : Number(expense.amount || 0);

  return (
    <div className="panel p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-semibold text-brand-teal">
              Shared expense
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                expense.settled
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {expense.settled ? "Settled" : "Open"}
            </span>
          </div>

          <h3 className="mt-3 text-xl font-semibold text-slate-900">
            {expense.description}
          </h3>
          <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <p>Paid by {expense.paidBy}</p>
            <p>Each share: {formatCurrency(perPersonShare)}</p>
            <p className="sm:col-span-2">
              Split among: {expense.splitAmong?.join(", ") || expense.paidBy}
            </p>
          </div>
        </div>

        <div className="rounded-[22px] bg-slate-900 px-5 py-4 text-white shadow-soft">
          <p className="soft-label text-white/60">Amount</p>
          <p className="mt-2 text-2xl font-semibold">
            {formatCurrency(expense.amount)}
          </p>
        </div>
      </div>

      {canManage && (
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => onEdit(expense)}
            className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-slate"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(expense)}
            className="rounded-2xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
