import { useState } from "react";
import { AlertTriangle, ArrowDownUp, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Tooltip from "../components/ui/Tooltip";
import {
  addTransaction,
  deleteTransaction,
  resetFilters,
  selectFilteredTransactions,
  selectFinanceStatus,
  selectRole,
  selectTransactionFilters,
  selectTransactions,
  selectVisibleSummary,
  updateTransaction,
  updateFilter,
} from "../store/financeSlice";
import {
  formatAmount,
  formatAmountByType,
  formatDisplayDate,
} from "../utils/formatters";

const emptyForm = {
  merchant: "",
  date: "2026-04-02",
  amount: "",
  category: "",
  type: "expense",
};

const typeOptions = ["all", "income", "expense"];
const sortOptions = [
  { value: "date-desc", label: "Newest first" },
  { value: "date-asc", label: "Oldest first" },
  { value: "amount-desc", label: "Highest amount" },
  { value: "amount-asc", label: "Lowest amount" },
  { value: "merchant-asc", label: "A to Z" },
  { value: "merchant-desc", label: "Z to A" },
];

export default function Transactions() {
  const dispatch = useDispatch();
  const role = useSelector(selectRole);
  const status = useSelector(selectFinanceStatus);
  const allTransactions = useSelector(selectTransactions);
  const filteredTransactions = useSelector(selectFilteredTransactions);
  const transactionFilters = useSelector(selectTransactionFilters);
  const visibleSummary = useSelector(selectVisibleSummary);
  const [form, setForm] = useState(emptyForm);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [pendingDelete, setPendingDelete] = useState(null);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleAddTransaction(event) {
    event.preventDefault();

    const merchant = form.merchant.trim();
    const category = form.category.trim();
    const amount = Number.parseFloat(form.amount);

    if (!merchant || !category || !form.date || Number.isNaN(amount) || amount <= 0) {
      return;
    }

    dispatch(
      addTransaction({
        merchant,
        date: form.date,
        amount,
        category,
        type: form.type,
      }),
    );
    dispatch(resetFilters());

    setForm({
      ...emptyForm,
      date: form.date,
    });
    setShowAddForm(false);
  }

  function handleEditStart(item) {
    setEditingId(item.id);
    setEditForm({
      merchant: item.merchant,
      date: item.date,
      amount: String(item.amount),
      category: item.category,
      type: item.type,
    });
  }

  function handleEditChange(event) {
    const { name, value } = event.target;
    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleEditCancel() {
    setEditingId(null);
    setEditForm(emptyForm);
  }

  function handleEditSave(event) {
    event.preventDefault();

    const merchant = editForm.merchant.trim();
    const category = editForm.category.trim();
    const amount = Number.parseFloat(editForm.amount);

    if (!merchant || !category || !editForm.date || Number.isNaN(amount) || amount <= 0) {
      return;
    }

    dispatch(
      updateTransaction({
        id: editingId,
        changes: {
          merchant,
          date: editForm.date,
          amount,
          category,
          type: editForm.type,
        },
      }),
    );
    handleEditCancel();
  }

  function handleDelete(id) {
    const transaction = allTransactions.find((item) => item.id === id);

    setPendingDelete(transaction ?? { id });
  }

  function handleDeleteConfirm() {
    if (!pendingDelete) {
      return;
    }

    dispatch(deleteTransaction(pendingDelete.id));

    if (editingId === pendingDelete.id) {
      handleEditCancel();
    }

    setPendingDelete(null);
  }

  function handleDeleteCancel() {
    setPendingDelete(null);
  }

  if (status === "loading" && allTransactions.length === 0) {
    return <LoadingState title="Loading your transactions..." />;
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[var(--accent)]">
            Transactions
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">
            Track every inflow and outflow
          </h2>
          <p className="mt-3 max-w-2xl text-base text-[var(--text-secondary)]">
            Review recent money movement, organize entries, and keep your records up to date.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SummaryTile
            label="Visible Income"
            value={formatAmount(visibleSummary.income)}
          />
          <SummaryTile
            label="Visible Expenses"
            value={formatAmount(visibleSummary.expense)}
          />
        </div>
      </div>

      {role === "admin" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowAddForm((current) => !current)}
              className="flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-semibold transition"
              style={{
                background: "var(--accent-soft)",
                color: "var(--accent)",
                boxShadow: "var(--shadow)",
                border: "1px solid var(--accent-border)",
              }}
              aria-label="Add transaction"
              title="Add transaction"
            >
              <Plus size={22} />
              <span>{showAddForm ? "Close Form" : "Add Transaction"}</span>
            </button>
          </div>

          {showAddForm ? (
            <Panel>
              <form
                onSubmit={handleAddTransaction}
                className="grid gap-4 lg:grid-cols-5"
              >
            <Field label="Merchant or source">
              <input
                name="merchant"
                value={form.merchant}
                onChange={handleFormChange}
                placeholder="UPI Salary, Rent, DMart..."
                className="w-full rounded-2xl border px-4 py-3 outline-none"
                style={fieldStyle}
              />
            </Field>

            <Field label="Date">
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleFormChange}
                className="w-full rounded-2xl border px-4 py-3 outline-none"
                style={fieldStyle}
              />
            </Field>

            <Field label="Amount">
              <input
                type="number"
                min="0"
                step="0.01"
                name="amount"
                value={form.amount}
                onChange={handleFormChange}
                placeholder="0"
                className="w-full rounded-2xl border px-4 py-3 outline-none"
                style={fieldStyle}
              />
            </Field>

            <Field label="Category">
              <input
                name="category"
                value={form.category}
                onChange={handleFormChange}
                placeholder="Rent, Groceries, Salary..."
                className="w-full rounded-2xl border px-4 py-3 outline-none"
                style={fieldStyle}
              />
            </Field>

            <Field label="Type">
              <select
                name="type"
                value={form.type}
                onChange={handleFormChange}
                className="w-full rounded-2xl border px-4 py-3 outline-none"
                style={fieldStyle}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </Field>

            <div className="flex justify-end lg:col-span-5">
              <button
                type="submit"
                className="rounded-2xl px-5 py-3 text-sm font-semibold transition"
                style={{
                  background: "var(--accent)",
                  color: "#08111f",
                  boxShadow: "var(--shadow)",
                }}
              >
                Add Transaction
              </button>
            </div>
              </form>
            </Panel>
          ) : null}
        </div>
      ) : null}

      <Panel>
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.7fr_0.7fr]">
          <label
            className="flex items-center gap-3 rounded-2xl border px-4 py-3"
            style={fieldStyle}
          >
            <Search size={18} className="text-[var(--text-secondary)]" />
            <input
              value={transactionFilters.search}
              onChange={(event) =>
                dispatch(
                  updateFilter({ name: "search", value: event.target.value }),
                )
              }
              placeholder="Search merchant, category, type, amount, or date..."
              className="w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
            />
          </label>

          <select
            value={transactionFilters.type}
            onChange={(event) =>
              dispatch(updateFilter({ name: "type", value: event.target.value }))
            }
            className="rounded-2xl border px-4 py-3 outline-none"
            style={fieldStyle}
          >
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {capitalize(option)}
              </option>
            ))}
          </select>

          <label
            className="flex items-center gap-3 rounded-2xl border px-4 py-3"
            style={fieldStyle}
          >
            <ArrowDownUp size={18} className="text-[var(--text-secondary)]" />
            <select
              value={transactionFilters.sortBy}
              onChange={(event) =>
                dispatch(
                  updateFilter({ name: "sortBy", value: event.target.value }),
                )
              }
              className="w-full bg-transparent outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {allTransactions.length === 0 ? (
          <EmptyState
            title="No transactions available"
            detail="Your transaction list is empty right now."
          />
        ) : (
          <>
            <div
              className="mt-6 hidden grid-cols-[1.2fr_1fr_1fr_0.9fr_0.8fr_0.9fr] gap-4 border-b pb-4 text-sm font-medium text-[var(--text-secondary)] md:grid"
              style={{ borderColor: "var(--card-border)" }}
            >
              <span>Merchant</span>
              <span>Date</span>
              <span>Category</span>
              <span>Type</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="mt-4 space-y-3">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((item) => (
                  <TransactionRow
                    key={item.id}
                    item={item}
                    role={role}
                    isEditing={editingId === item.id}
                    editForm={editForm}
                    onEditStart={handleEditStart}
                    onEditChange={handleEditChange}
                    onEditCancel={handleEditCancel}
                    onEditSave={handleEditSave}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <EmptyState
                  title="No matching transactions"
                  detail="Try adjusting your search or filters."
                  compact
                />
              )}
            </div>
          </>
        )}
      </Panel>
      <DeleteConfirmationDialog
        transaction={pendingDelete}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </section>
  );
}

function TransactionRow({
  item,
  role,
  isEditing,
  editForm,
  onEditStart,
  onEditChange,
  onEditCancel,
  onEditSave,
  onDelete,
}) {
  const amountColor = item.type === "income" ? "var(--success)" : "var(--danger)";

  if (isEditing) {
    return (
      <div
        className="rounded-[1.5rem] border px-4 py-4 md:px-5"
        style={{
          borderColor: "var(--accent-border)",
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <form onSubmit={onEditSave} className="grid gap-4 lg:grid-cols-5">
          <Field label="Merchant or source">
            <input
              name="merchant"
              value={editForm.merchant}
              onChange={onEditChange}
              className="w-full rounded-2xl border px-4 py-3 outline-none"
              style={fieldStyle}
            />
          </Field>

          <Field label="Date">
            <input
              type="date"
              name="date"
              value={editForm.date}
              onChange={onEditChange}
              className="w-full rounded-2xl border px-4 py-3 outline-none"
              style={fieldStyle}
            />
          </Field>

          <Field label="Amount">
            <input
              type="number"
              min="0"
              step="0.01"
              name="amount"
              value={editForm.amount}
              onChange={onEditChange}
              className="w-full rounded-2xl border px-4 py-3 outline-none"
              style={fieldStyle}
            />
          </Field>

          <Field label="Category">
            <input
              name="category"
              value={editForm.category}
              onChange={onEditChange}
              className="w-full rounded-2xl border px-4 py-3 outline-none"
              style={fieldStyle}
            />
          </Field>

          <Field label="Type">
            <select
              name="type"
              value={editForm.type}
              onChange={onEditChange}
              className="w-full rounded-2xl border px-4 py-3 outline-none"
              style={fieldStyle}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </Field>

          <div className="flex flex-wrap justify-end gap-3 lg:col-span-5">
            <button
              type="button"
              onClick={onEditCancel}
              className="rounded-2xl border px-4 py-3 text-sm font-semibold transition"
              style={{ borderColor: "var(--card-border)", color: "var(--text-secondary)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-2xl px-5 py-3 text-sm font-semibold transition"
              style={{
                background: "var(--accent)",
                color: "#08111f",
                boxShadow: "var(--shadow)",
              }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      className="rounded-[1.5rem] border px-4 py-4 md:px-5"
      style={{
        borderColor: "var(--card-border)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div className="space-y-3 md:hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold">{item.merchant}</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {formatDisplayDate(item.date)}
            </p>
          </div>
          <div className="text-right">
            <span className="font-semibold" style={{ color: amountColor }}>
              {formatAmountByType(item.amount, item.type)}
            </span>
            {role === "admin" ? (
              <div className="mt-3 flex justify-end gap-2">
                <AdminIconButton
                  label="Edit transaction"
                  icon={Pencil}
                  onClick={() => onEditStart(item)}
                />
                <AdminIconButton
                  label="Delete transaction"
                  icon={Trash2}
                  tone="danger"
                  onClick={() => onDelete(item.id)}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <InfoPill>{item.category}</InfoPill>
          <InfoPill accent={item.type === "income"}>
            {capitalize(item.type)}
          </InfoPill>
        </div>
      </div>

      <div className="hidden grid-cols-[1.2fr_1fr_1fr_0.9fr_0.8fr_0.9fr] items-center gap-4 md:grid">
        <span className="font-medium">{item.merchant}</span>
        <span className="text-[var(--text-secondary)]">
          {formatDisplayDate(item.date)}
        </span>
        <span className="text-[var(--text-secondary)]">{item.category}</span>
        <span>
          <InfoPill accent={item.type === "income"}>{capitalize(item.type)}</InfoPill>
        </span>
        <span className="text-right font-semibold" style={{ color: amountColor }}>
          {formatAmountByType(item.amount, item.type)}
        </span>
        <div className="flex justify-end gap-2">
          {role === "admin" ? (
            <>
              <AdminIconButton
                label="Edit transaction"
                icon={Pencil}
                onClick={() => onEditStart(item)}
              />
              <AdminIconButton
                label="Delete transaction"
                icon={Trash2}
                tone="danger"
                onClick={() => onDelete(item.id)}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AdminIconButton({ label, icon, onClick, tone = "default" }) {
  const IconComponent = icon;

  return (
    <Tooltip content={label} position="top">
      <button
        type="button"
        onClick={onClick}
        className="flex h-9 w-9 items-center justify-center rounded-xl border transition"
        style={{
          borderColor: tone === "danger" ? "rgba(248, 113, 113, 0.35)" : "var(--card-border)",
          background:
            tone === "danger" ? "rgba(248, 113, 113, 0.08)" : "rgba(255,255,255,0.03)",
          color: tone === "danger" ? "var(--danger)" : "var(--text-secondary)",
        }}
        aria-label={label}
      >
        <IconComponent size={16} />
      </button>
    </Tooltip>
  );
}

function SummaryTile({ label, value }) {
  return (
    <div
      className="rounded-[1.75rem] border p-5"
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
        boxShadow: "var(--shadow)",
      }}
    >
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function InfoPill({ children, accent = false }) {
  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
      style={{
        background: accent ? "rgba(52, 211, 153, 0.12)" : "var(--accent-soft)",
        color: accent ? "var(--success)" : "var(--accent)",
      }}
    >
      {children}
    </span>
  );
}

function EmptyState({ title, detail, compact = false }) {
  return (
    <div
      className={`rounded-[1.5rem] border px-5 text-center ${compact ? "py-8" : "mt-6 py-10"}`}
      style={{
        borderColor: "var(--card-border)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <p className="text-lg font-semibold">{title}</p>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{detail}</p>
    </div>
  );
}

function LoadingState({ title }) {
  return (
    <section
      className="rounded-[2rem] border p-8"
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
        boxShadow: "var(--shadow)",
      }}
    >
      <p className="text-sm uppercase tracking-[0.24em] text-[var(--accent)]">
        Transactions
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h2>
    </section>
  );
}

function DeleteConfirmationDialog({ transaction, onCancel, onConfirm }) {
  if (!transaction) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close delete confirmation"
        className="absolute inset-0"
        style={{ background: "rgba(5, 11, 22, 0.72)", backdropFilter: "blur(12px)" }}
        onClick={onCancel}
      />

      <div
        className="relative w-full max-w-lg rounded-[2rem] border p-6 md:p-7"
        style={{
          background: "linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(11, 18, 32, 0.98))",
          borderColor: "rgba(248, 113, 113, 0.2)",
          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.45)",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-[1.4rem]"
            style={{
              background: "rgba(248, 113, 113, 0.14)",
              color: "var(--danger)",
              border: "1px solid rgba(248, 113, 113, 0.24)",
            }}
          >
            <AlertTriangle size={24} />
          </div>

          <div className="flex-1">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--danger)]">
              Delete transaction
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">
              Remove this record?
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              This action will permanently remove
              <span className="font-semibold text-[var(--text-primary)]">
                {` ${transaction.merchant ?? "this transaction"}`}
              </span>
              {transaction.date ? ` from ${formatDisplayDate(transaction.date)}` : ""}.
            </p>
          </div>
        </div>

        <div
          className="mt-6 rounded-[1.5rem] border p-4"
          style={{
            borderColor: "var(--card-border)",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-[var(--text-secondary)]">Category</span>
            <span className="font-medium text-[var(--text-primary)]">
              {transaction.category ?? "Not specified"}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 text-sm">
            <span className="text-[var(--text-secondary)]">Amount</span>
            <span
              className="font-semibold"
              style={{
                color:
                  transaction.type === "income" ? "var(--success)" : "var(--danger)",
              }}
            >
              {typeof transaction.amount === "number"
                ? formatAmountByType(transaction.amount, transaction.type ?? "expense")
                : "-"}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border px-5 py-3 text-sm font-semibold transition"
            style={{
              borderColor: "var(--card-border)",
              color: "var(--text-secondary)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl px-5 py-3 text-sm font-semibold transition"
            style={{
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(251, 113, 133, 0.95))",
              color: "#fff",
              boxShadow: "0 16px 30px rgba(239, 68, 68, 0.25)",
            }}
          >
            Delete Transaction
          </button>
        </div>
      </div>
    </div>
  );
}

function Panel({ children }) {
  return (
    <div
      className="rounded-[2rem] border p-6"
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
        boxShadow: "var(--shadow)",
        backdropFilter: "blur(18px)",
      }}
    >
      {children}
    </div>
  );
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const fieldStyle = {
  background: "var(--bg-elevated)",
  borderColor: "var(--card-border)",
};
