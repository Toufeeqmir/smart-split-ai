import React, { useEffect, useMemo, useRef, useState } from "react";
import BalanceSummary from "../components/BalanceSummary";
import ExpenseCard from "../components/ExpenseCard";
import Button from "../components/Button";
import api from "../services/api";

const createInitialForm = (username = "") => ({
  description: "",
  amount: "",
  paidBy: username,
  splitAmong: username ? [username] : [],
  settled: false,
});

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingExpenseId, setEditingExpenseId] = useState("");
  const [form, setForm] = useState(createInitialForm(user?.username));
  const formRef = useRef(null);

  const members = useMemo(() => {
    const allMembers = new Set();

    if (user?.username) {
      allMembers.add(user.username);
    }

    users.forEach((person) => allMembers.add(person.username));
    expenses.forEach((expense) => {
      allMembers.add(expense.paidBy);
      expense.splitAmong?.forEach((member) => allMembers.add(member));
    });

    return [...allMembers];
  }, [expenses, user, users]);

  const stats = useMemo(() => {
    const totalAmount = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0
    );
    const settledCount = expenses.filter((expense) => expense.settled).length;
    const openCount = expenses.length - settledCount;

    return [
      {
        label: "Tracked volume",
        value: `Rs ${totalAmount.toFixed(2)}`,
        tone: "from-brand-ink via-brand-slate to-slate-900 text-white",
      },
      {
        label: "Members",
        value: String(members.length),
        tone: "bg-white text-slate-900",
      },
      {
        label: "Open expenses",
        value: String(openCount),
        tone: "bg-white text-slate-900",
      },
      {
        label: "Settled items",
        value: String(settledCount),
        tone: "bg-white text-slate-900",
      },
    ];
  }, [expenses, members.length]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!localStorage.getItem("token")) {
          setError("Please login first.");
          setLoading(false);
          return;
        }

        const [expenseRes, usersRes] = await Promise.all([
          api.get("/expenses"),
          api.get("/auth/users"),
        ]);

        setExpenses(expenseRes.data);
        setUsers(usersRes.data);
        setError("");
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "settled") {
      setForm((prev) => ({ ...prev, settled: checked }));
      return;
    }

    if (name === "paidBy") {
      setForm((prev) => {
        const nextSplitAmong = prev.splitAmong.includes(value)
          ? prev.splitAmong
          : [...prev.splitAmong, value];

        return {
          ...prev,
          paidBy: value,
          splitAmong: nextSplitAmong,
        };
      });
      return;
    }

    setForm((prev) => ({ ...prev, [name]: type === "number" ? value : value }));
  };

  const handleMemberToggle = (member) => {
    setForm((prev) => {
      const alreadySelected = prev.splitAmong.includes(member);

      if (alreadySelected && member === prev.paidBy) {
        return prev;
      }

      return {
        ...prev,
        splitAmong: alreadySelected
          ? prev.splitAmong.filter((item) => item !== member)
          : [...prev.splitAmong, member],
      };
    });
  };

  const resetForm = () => {
    setEditingExpenseId("");
    setForm(createInitialForm(user?.username));
  };

  const saveExpense = async () => {
    if (!form.description || !form.amount || !form.paidBy || form.splitAmong.length === 0) {
      setError("Fill in the description, amount, payer, and members.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        description: form.description,
        amount: Number(form.amount),
        paidBy: form.paidBy,
        splitAmong: form.splitAmong,
        settled: form.settled,
      };

      if (editingExpenseId) {
        const { data } = await api.put(`/expenses/${editingExpenseId}`, payload);
        setExpenses((prev) =>
          prev.map((expense) => (expense._id === editingExpenseId ? data : expense))
        );
      } else {
        const { data } = await api.post("/expenses", payload);
        setExpenses((prev) => [data, ...prev]);
      }

      resetForm();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to save expense."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpenseId(expense._id);
    setForm({
      description: expense.description,
      amount: expense.amount,
      paidBy: expense.paidBy,
      splitAmong: expense.splitAmong || [],
      settled: Boolean(expense.settled),
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDelete = async (expense) => {
    const confirmed = window.confirm(`Delete "${expense.description}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await api.delete(`/expenses/${expense._id}`);
      setExpenses((prev) => prev.filter((item) => item._id !== expense._id));

      if (editingExpenseId === expense._id) {
        resetForm();
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to delete expense."
      );
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel relative overflow-hidden px-6 py-7 sm:px-8">
        <div className="pointer-events-none absolute right-[-2rem] top-[-2rem] h-40 w-40 rounded-full bg-brand-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-2rem] left-[-2rem] h-44 w-44 rounded-full bg-brand-teal/15 blur-3xl" />

        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_420px]">
          <div>
            <p className="soft-label">Expense command center</p>
            <h2 className="mt-3 text-4xl font-semibold text-slate-950">
              Keep shared spending clear, balanced, and easy to settle.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Shared expenses are visible to every member included in the split.
              Add bills, track who paid, and see who should settle up at a glance.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-full bg-brand-ink px-4 py-2 text-sm font-medium text-white">
                Active user: {user?.username || "Guest"}
              </div>
              <div className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600">
                {expenses.length} expense{expenses.length === 1 ? "" : "s"} tracked
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {stats.map((item) => (
              <div
                key={item.label}
                className={`rounded-[24px] border border-white/40 px-5 py-5 shadow-soft ${
                  item.tone.startsWith("from")
                    ? `bg-gradient-to-br ${item.tone}`
                    : item.tone
                }`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                    item.tone.includes("text-white") ? "text-white/70" : "text-slate-500"
                  }`}
                >
                  {item.label}
                </p>
                <p className="mt-3 text-3xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BalanceSummary members={members} expenses={expenses} />

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section ref={formRef} className="panel p-6 sm:p-7 xl:sticky xl:top-24">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="soft-label">New entry</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                {editingExpenseId ? "Edit expense" : "Add an expense"}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Capture the bill, payer, and everyone sharing the cost.
              </p>
            </div>
            {editingExpenseId && (
              <button
                onClick={resetForm}
                className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
              >
                Cancel
              </button>
            )}
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <label className="soft-label">Description</label>
              <input
                type="text"
                name="description"
                placeholder="Dinner, rent, groceries..."
                value={form.description}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="space-y-2">
              <label className="soft-label">Amount</label>
              <input
                type="number"
                name="amount"
                placeholder="Amount (Rs)"
                value={form.amount}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="space-y-2">
              <label className="soft-label">Paid by</label>
              <select
                name="paidBy"
                value={form.paidBy}
                onChange={handleChange}
                className="form-input bg-white"
              >
                {members.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="soft-label">Split among</label>
              <div className="grid gap-3 sm:grid-cols-2">
                {members.map((member) => {
                  const selected = form.splitAmong.includes(member);

                  return (
                    <label
                      key={member}
                      className={`flex cursor-pointer items-center gap-3 rounded-[22px] border px-4 py-3 transition ${
                        selected
                          ? "border-brand-teal/35 bg-brand-teal/10"
                          : "border-slate-200 bg-white/90 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => handleMemberToggle(member)}
                        className="h-4 w-4 rounded border-slate-300 text-brand-teal focus:ring-brand-teal/20"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{member}</p>
                        <p className="text-xs text-slate-500">
                          Included in the split
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                name="settled"
                checked={form.settled}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-brand-teal focus:ring-brand-teal/20"
              />
              Mark this expense as already settled
            </label>

            <Button
              text={
                saving
                  ? "Saving..."
                  : editingExpenseId
                    ? "Update Expense"
                    : "Add Expense"
              }
              onClick={saveExpense}
              type="primary"
              disabled={saving}
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="soft-label">Ledger</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                Shared expenses
              </h3>
            </div>
            <p className="text-sm text-slate-500">
              Review, edit, or settle entries as the group changes.
            </p>
          </div>

          {loading ? (
            <div className="panel px-6 py-10 text-center text-slate-500">
              Loading expenses...
            </div>
          ) : expenses.length === 0 ? (
            <div className="panel px-6 py-10 text-center">
              <p className="text-xl font-semibold text-slate-800">No expenses yet</p>
              <p className="mt-2 text-sm text-slate-500">
                Add your first shared bill to start tracking balances.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <ExpenseCard
                  key={expense._id}
                  expense={expense}
                  currentUser={user?.username}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
