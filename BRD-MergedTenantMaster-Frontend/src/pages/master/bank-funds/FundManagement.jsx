import React, { useState } from "react";
import {
  FiPlus, FiEdit3, FiTrash2, FiSearch, FiEye,
  FiX, FiSave, FiDollarSign,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// ─── Constants ─────────────────────────────────────────────────────────────────
const FUND_TYPES = ["Internal Fund", "Borrowed Fund", "Corpus Fund"];

// ─── Main Component ────────────────────────────────────────────────────────────
const FundManagement = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editFund, setEditFund] = useState(null);

  const [funds, setFunds] = useState([
    {
      id: 1,
      fund_type: "Internal Fund",
      fund_source: "Company Reserve",
      available_amount: 50000000,
      fund_allocation_logic: "Used first before borrowed funds",
      status: "Active",
    },
    {
      id: 2,
      fund_type: "Borrowed Fund",
      fund_source: "Bank Loan",
      available_amount: 20000000,
      fund_allocation_logic: "Secondary allocation after internal fund",
      status: "Active",
    },
    {
      id: 3,
      fund_type: "Corpus Fund",
      fund_source: "Investor Capital",
      available_amount: 10000000,
      fund_allocation_logic: "Reserve for high-value corporate loans",
      status: "Inactive",
    },
  ]);

  const filtered = funds.filter(
    (f) =>
      f.fund_type.toLowerCase().includes(search.toLowerCase()) ||
      f.fund_source.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => {
    if (!window.confirm("Delete this fund?")) return;
    setFunds((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSaveNew = (data) => {
    setFunds((prev) => [...prev, { id: Date.now(), ...data, status: "Active" }]);
    setShowAddModal(false);
  };

  const handleSaveEdit = (data) => {
    setFunds((prev) =>
      prev.map((f) => (f.id === editFund.id ? { ...f, ...data } : f))
    );
    setEditFund(null);
  };

  return (
    <>
      {/* HEADER — pt-2 adds breathing room at the top */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 pt-2">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Fund Management</h1>
          <p className="text-sm text-gray-500">
            Configure and manage fund pools and allocation logic
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <FiPlus /> Add Fund
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-sm">
        <FiSearch className="text-gray-400 flex-shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by fund type or source..."
          className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* TABLE */}
      <div className="space-y-3">
        <div className="hidden md:grid grid-cols-7 bg-gray-100 rounded-xl px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
          <div className="col-span-2">Fund Type / Source</div>
          <div className="col-span-2">Allocation Logic</div>
          <div>Amount</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        {filtered.map((f) => (
          <div
            key={f.id}
            className="bg-white rounded-2xl px-5 py-4 shadow-sm grid grid-cols-2 md:grid-cols-7 gap-y-2 items-center text-sm hover:shadow-md transition"
          >
            <div className="col-span-2 flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <FiDollarSign className="text-blue-500 text-base" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{f.fund_type}</p>
                <p className="text-xs text-gray-400">{f.fund_source}</p>
              </div>
            </div>
            <div className="col-span-2 text-gray-500 text-xs truncate pr-4">
              {f.fund_allocation_logic || "—"}
            </div>
            <div className="text-gray-700 font-medium text-sm">
              ₹ {Number(f.available_amount).toLocaleString("en-IN")}
            </div>
            <StatusBadge status={f.status} />
            <div className="flex justify-end gap-2 col-span-2 md:col-span-1">
              <IconButton
                color="gray"
                title="View"
                onClick={() => navigate(`/fund-management/view/${f.id}`)}
              >
                <FiEye />
              </IconButton>
              <IconButton color="blue" title="Edit" onClick={() => setEditFund(f)}>
                <FiEdit3 />
              </IconButton>
              <IconButton color="red" title="Delete" onClick={() => handleDelete(f.id)}>
                <FiTrash2 />
              </IconButton>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <FiDollarSign className="text-gray-300 text-4xl mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No funds found.</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddFundModal onClose={() => setShowAddModal(false)} onSave={handleSaveNew} />
      )}
      {editFund && (
        <EditFundModal
          fund={editFund}
          onClose={() => setEditFund(null)}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
};

export default FundManagement;

// ─── Add Fund Modal ────────────────────────────────────────────────────────────
const AddFundModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    fund_type: "",
    fund_source: "",
    available_amount: "",
    fund_allocation_logic: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const getErrors = (f) => {
    const e = {};
    if (!String(f.fund_type).trim()) e.fund_type = "Fund type is required";
    if (!String(f.fund_source).trim()) e.fund_source = "Fund source is required";
    if (!f.available_amount || Number(f.available_amount) <= 0)
      e.available_amount = "Amount must be greater than 0";
    return e;
  };

  const errors = submitted ? getErrors(form) : {};
  const hasErrors = Object.keys(getErrors(form)).length > 0;

  const handleChange = (e, isNumber = false) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: isNumber ? value : String(value) }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (hasErrors) return;
    setSubmitting(true);
    try {
      // await bankFundService.createFund(form);
      onSave({ ...form, available_amount: Number(form.available_amount) });
    } catch (err) {
      console.error("Create fund failed:", err);
      alert("Failed to create fund.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell title="Add Fund" subtitle="Configure a new fund pool" onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Fund Type" required error={errors.fund_type}>
          <select
            name="fund_type"
            value={form.fund_type}
            onChange={handleChange}
            className={inputClass(errors.fund_type)}
          >
            <option value="">— Select Type —</option>
            {FUND_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Fund Source" required error={errors.fund_source}>
          <input
            type="text"
            name="fund_source"
            value={form.fund_source}
            onChange={handleChange}
            placeholder="e.g. Company Reserve"
            className={inputClass(errors.fund_source)}
          />
        </FormField>

        <FormField label="Available Amount" required error={errors.available_amount}>
          <input
            type="number"
            name="available_amount"
            value={form.available_amount}
            onChange={(e) => handleChange(e, true)}
            placeholder="e.g. 5000000"
            min="0"
            className={inputClass(errors.available_amount)}
          />
        </FormField>

        <FormField label="Fund Allocation Logic" className="md:col-span-2">
          <textarea
            name="fund_allocation_logic"
            value={form.fund_allocation_logic}
            onChange={handleChange}
            rows={3}
            placeholder="Describe how this fund should be allocated..."
            className={inputClass()}
          />
        </FormField>
      </div>

      <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={onClose}
          className="bg-gray-100 text-gray-600 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={hasErrors || submitting}
          className={`px-5 py-2.5 rounded-xl text-white flex items-center gap-2 text-sm font-medium transition ${
            hasErrors || submitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <FiSave /> {submitting ? "Saving..." : "Save Fund"}
        </button>
      </div>
    </ModalShell>
  );
};

// ─── Edit Fund Modal ───────────────────────────────────────────────────────────
const EditFundModal = ({ fund, onClose, onSave }) => {
  const [form, setForm] = useState({
    fund_type: fund.fund_type || "",
    fund_source: fund.fund_source || "",
    available_amount: fund.available_amount || "",
    fund_allocation_logic: fund.fund_allocation_logic || "",
    status: fund.status || "Active",
  });

  const [submitted, setSubmitted] = useState(false);

  const getErrors = (f) => {
    const e = {};
    if (!String(f.fund_type).trim()) e.fund_type = "Fund type is required";
    if (!String(f.fund_source).trim()) e.fund_source = "Fund source is required";
    if (!f.available_amount || Number(f.available_amount) <= 0)
      e.available_amount = "Amount must be greater than 0";
    return e;
  };

  const errors = submitted ? getErrors(form) : {};
  const hasErrors = Object.keys(getErrors(form)).length > 0;

  const handleChange = (e, isNumber = false) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: isNumber ? value : String(value) }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (hasErrors) return;
    onSave({ ...form, available_amount: Number(form.available_amount) });
  };

  return (
    <ModalShell title="Edit Fund" subtitle="Update fund details and allocation logic" onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Fund Type" required error={errors.fund_type}>
          <select
            name="fund_type"
            value={form.fund_type}
            onChange={handleChange}
            className={inputClass(errors.fund_type)}
          >
            <option value="">— Select Type —</option>
            {FUND_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Fund Source" required error={errors.fund_source}>
          <input
            type="text"
            name="fund_source"
            value={form.fund_source}
            onChange={handleChange}
            className={inputClass(errors.fund_source)}
          />
        </FormField>

        <FormField label="Available Amount" required error={errors.available_amount}>
          <input
            type="number"
            name="available_amount"
            value={form.available_amount}
            onChange={(e) => handleChange(e, true)}
            min="0"
            className={inputClass(errors.available_amount)}
          />
        </FormField>

        <FormField label="Status">
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className={inputClass()}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </FormField>

        <FormField label="Fund Allocation Logic" className="md:col-span-2">
          <textarea
            name="fund_allocation_logic"
            value={form.fund_allocation_logic}
            onChange={handleChange}
            rows={3}
            className={inputClass()}
          />
        </FormField>
      </div>

      <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={onClose}
          className="bg-gray-100 text-gray-600 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={hasErrors}
          className={`px-5 py-2.5 rounded-xl text-white flex items-center gap-2 text-sm font-medium transition ${
            hasErrors
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <FiSave /> Update Fund
        </button>
      </div>
    </ModalShell>
  );
};

// ─── Shared Modal Shell ────────────────────────────────────────────────────────
const ModalShell = ({ title, subtitle, onClose, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
        >
          <FiX className="text-lg" />
        </button>
      </div>
      <div className="overflow-y-auto px-6 py-5 flex-1">
        {children}
      </div>
    </div>
  </div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inputClass = (error) =>
  `w-full px-3 py-2.5 rounded-xl text-sm outline-none transition border ${
    error
      ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100"
      : "border-gray-200 bg-gray-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
  }`;

const FormField = ({ label, required, error, className, children }) => (
  <div className={className}>
    <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const StatusBadge = ({ status }) => (
  <div className="flex items-center">
    <span
      className={`px-3 py-1 text-xs rounded-full font-medium ${
        status === "Active"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-600"
      }`}
    >
      {status}
    </span>
  </div>
);

const IconButton = ({ children, onClick, color, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded-full bg-${color}-100 hover:bg-${color}-200 transition`}
  >
    <span className={`text-${color}-600`}>{children}</span>
  </button>
);