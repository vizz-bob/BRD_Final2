import React, { useState, useEffect } from "react";
import {
  FiPlus, FiEdit3, FiTrash2, FiSearch, FiEye, FiSave, FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { bankFundService } from "../../../services/bankFundService";

const RECEIPT_MODES = ["NEFT", "RTGS", "IMPS", "UPI", "Cheque"];
const PAYMENT_MODES = ["ECS", "NACH", "Cheque", "UPI"];
const STATUS_OPTIONS = ["ACTIVE", "INACTIVE"];

// ─── Main Component ────────────────────────────────────────────────────────────
const ModeOfBank = () => {
  const navigate = useNavigate();
  const [modes, setModes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMode, setEditMode] = useState(null);

  useEffect(() => {
    async function fetchModes() {
      setLoading(true);
      try {
        const data = await bankFundService.getTransactionModes();
        setModes(Array.isArray(data) ? data : data?.results || []);
      } catch (err) {
        console.error("Failed to fetch modes:", err);
        alert("Error fetching modes");
      } finally {
        setLoading(false);
      }
    }
    fetchModes();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this mode?")) return;
    try {
      await bankFundService.deleteTransactionMode(id);
      setModes((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to delete mode:", err);
      alert("Error deleting mode");
    }
  };

  const handleSaveNew = (newMode) => {
    setModes((prev) => [...prev, { id: Date.now(), ...newMode }]);
    setShowAddModal(false);
  };

  const handleSaveEdit = (updated) => {
    setModes((prev) =>
      prev.map((m) => (m.id === editMode.id ? { ...m, ...updated } : m))
    );
    setEditMode(null);
  };

  const filteredModes = (Array.isArray(modes) ? modes : []).filter((m) =>
    (m?.mode_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (m?.mode_type || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* HEADER — pt-2 for breathing room */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 pt-2">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Mode of Bank Transactions</h1>
          <p className="text-sm text-gray-500">Define receipt and payment modes</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <FiPlus /> Add Mode
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-sm">
        <FiSearch className="text-gray-400 flex-shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search receipt or payment mode..."
          className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading modes...</div>
      ) : (
        <div className="space-y-3">
          <div className="hidden md:grid grid-cols-6 bg-gray-100 rounded-xl px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
            <div>Mode Type</div>
            <div>Mode Name</div>
            <div>Default</div>
            <div>Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {filteredModes.map((mode) => (
            <div
              key={mode.id}
              className="bg-white rounded-2xl px-5 py-4 shadow-sm grid grid-cols-2 md:grid-cols-6 gap-y-2 items-center text-sm hover:shadow-md transition"
            >
              <div className="font-medium text-gray-900">{mode.mode_type}</div>
              <div className="text-gray-600">{mode.mode_name}</div>
              <div className="text-gray-600">{mode.is_default ? "Yes" : "No"}</div>
              <div>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    mode.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {mode.status}
                </span>
              </div>
              <div className="flex justify-end gap-2 col-span-2">
                <IconButton
                  color="gray"
                  title="View"
                  onClick={() => navigate(`/mode-of-bank/view/${mode.id}`)}
                >
                  <FiEye />
                </IconButton>
                <IconButton
                  color="blue"
                  title="Edit"
                  onClick={() => setEditMode(mode)}
                >
                  <FiEdit3 />
                </IconButton>
                <IconButton color="red" title="Delete" onClick={() => handleDelete(mode.id)}>
                  <FiTrash2 />
                </IconButton>
              </div>
            </div>
          ))}

          {filteredModes.length === 0 && !loading && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm text-gray-400 text-sm">
              No modes found.
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <AddModeModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveNew}
        />
      )}
      {editMode && (
        <EditModeModal
          mode={editMode}
          onClose={() => setEditMode(null)}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
};

export default ModeOfBank;

// ─── Add Mode Modal ────────────────────────────────────────────────────────────
const AddModeModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    receipt_mode: "",
    payment_mode: "",
    is_default: false,
    status: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const getErrors = (f) => {
    const e = {};
    if (!f.receipt_mode) e.receipt_mode = "Receipt mode is required";
    if (!f.payment_mode) e.payment_mode = "Payment mode is required";
    if (!f.status) e.status = "Status is required";
    return e;
  };

  const errors = submitted ? getErrors(form) : {};
  const hasErrors = Object.keys(getErrors(form)).length > 0;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (hasErrors) return;
    setSaving(true);
    try {
      const newMode = await bankFundService.createTransactionMode(form);
      onSave(newMode || form);
    } catch (err) {
      console.error("Failed to create mode:", err);
      alert("Error creating mode");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Add Mode" subtitle="Configure a new bank transaction mode" onClose={onClose}>
      <FormField label="Mode of Receipts" required error={errors.receipt_mode}>
        <select
          name="receipt_mode"
          value={form.receipt_mode}
          onChange={handleChange}
          className={inputClass(errors.receipt_mode)}
        >
          <option value="">— Select Receipt Mode —</option>
          {RECEIPT_MODES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Mode of Payments" required error={errors.payment_mode}>
        <select
          name="payment_mode"
          value={form.payment_mode}
          onChange={handleChange}
          className={inputClass(errors.payment_mode)}
        >
          <option value="">— Select Payment Mode —</option>
          {PAYMENT_MODES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Status" required error={errors.status}>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className={inputClass(errors.status)}
        >
          <option value="">— Select Status —</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Default Mode">
        <label className="flex items-center gap-2 text-sm text-gray-700 mt-1">
          <input
            type="checkbox"
            name="is_default"
            checked={form.is_default}
            onChange={handleChange}
            className="accent-blue-600"
          />
          Set as Default
        </label>
      </FormField>

      <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={onClose}
          className="bg-gray-100 text-gray-600 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className={`px-5 py-2.5 rounded-xl text-white flex items-center gap-2 text-sm font-medium transition ${
            saving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <FiSave /> {saving ? "Saving..." : "Save Mode"}
        </button>
      </div>
    </ModalShell>
  );
};

// ─── Edit Mode Modal ───────────────────────────────────────────────────────────
const EditModeModal = ({ mode, onClose, onSave }) => {
  const [form, setForm] = useState({
    receipt_mode: mode.receipt_mode || "",
    payment_mode: mode.payment_mode || "",
    is_default: mode.is_default || false,
    status: mode.status || "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const getErrors = (f) => {
    const e = {};
    if (!f.receipt_mode) e.receipt_mode = "Receipt mode is required";
    if (!f.payment_mode) e.payment_mode = "Payment mode is required";
    if (!f.status) e.status = "Status is required";
    return e;
  };

  const errors = submitted ? getErrors(form) : {};
  const hasErrors = Object.keys(getErrors(form)).length > 0;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (hasErrors) return;
    setSaving(true);
    try {
      await bankFundService.updateTransactionMode(mode.id, form);
      onSave(form);
    } catch (err) {
      console.error("Failed to update mode:", err);
      alert("Error updating mode");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Edit Mode" subtitle="Update bank transaction mode details" onClose={onClose}>
      <FormField label="Mode of Receipts" required error={errors.receipt_mode}>
        <select
          name="receipt_mode"
          value={form.receipt_mode}
          onChange={handleChange}
          className={inputClass(errors.receipt_mode)}
        >
          <option value="">— Select Receipt Mode —</option>
          {RECEIPT_MODES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Mode of Payments" required error={errors.payment_mode}>
        <select
          name="payment_mode"
          value={form.payment_mode}
          onChange={handleChange}
          className={inputClass(errors.payment_mode)}
        >
          <option value="">— Select Payment Mode —</option>
          {PAYMENT_MODES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Status" required error={errors.status}>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className={inputClass(errors.status)}
        >
          <option value="">— Select Status —</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Default Mode">
        <label className="flex items-center gap-2 text-sm text-gray-700 mt-1">
          <input
            type="checkbox"
            name="is_default"
            checked={form.is_default}
            onChange={handleChange}
            className="accent-blue-600"
          />
          Set as Default
        </label>
      </FormField>

      <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={onClose}
          className="bg-gray-100 text-gray-600 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className={`px-5 py-2.5 rounded-xl text-white flex items-center gap-2 text-sm font-medium transition ${
            saving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <FiSave /> {saving ? "Updating..." : "Update Mode"}
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

const FormField = ({ label, required, error, children }) => (
  <div className="mb-4">
    <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
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