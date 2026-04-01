import React, { useState, useEffect } from "react";
import {
  FiPlus, FiEdit3, FiTrash2, FiSearch, FiEye, FiSave, FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { bankFundService } from "../../../services/bankFundService";

const TAX_TYPES = ["GST", "TDS", "TCS", "Service Tax", "Stamp Duty"];
const TAX_CATEGORIES = ["Direct", "Indirect", "Withholding", "Surcharge"];
const STATUS_OPTIONS = ["ACTIVE", "INACTIVE"];

// ─── Main Component ────────────────────────────────────────────────────────────
const TaxationManagement = () => {
  const navigate = useNavigate();
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTax, setEditTax] = useState(null);

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    setLoading(true);
    try {
      const data = await bankFundService.getTaxes();
      setTaxes(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error("Failed to fetch taxes:", err);
      alert("Error fetching taxes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this tax entry?")) return;
    try {
      await bankFundService.deleteTax(id);
      setTaxes((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete tax:", err);
      alert("Error deleting tax");
    }
  };

  const handleSaveNew = (newTax) => {
    setTaxes((prev) => [...prev, { id: Date.now(), ...newTax }]);
    setShowAddModal(false);
  };

  const handleSaveEdit = (updated) => {
    setTaxes((prev) =>
      prev.map((t) => (t.id === editTax.id ? { ...t, ...updated } : t))
    );
    setEditTax(null);
  };

  const filteredTaxes = (Array.isArray(taxes) ? taxes : []).filter(
    (t) =>
      (t?.tax_type || "").toLowerCase().includes(search.toLowerCase()) ||
      (t?.tax_category || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* HEADER — pt-2 for breathing room */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 pt-2">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Taxation Management</h1>
          <p className="text-sm text-gray-500">Manage tax types, categories, and rates</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <FiPlus /> Add Tax
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-sm">
        <FiSearch className="text-gray-400 flex-shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tax type or category..."
          className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading taxes...</div>
      ) : (
        <div className="space-y-3">
          <div className="hidden md:grid grid-cols-7 bg-gray-100 rounded-xl px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
            <div>Tax Type</div>
            <div>Category</div>
            <div>Rate (%)</div>
            <div>Valid From</div>
            <div>Valid To</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          {filteredTaxes.map((tax) => (
            <div
              key={tax.id}
              className="bg-white rounded-2xl px-5 py-4 shadow-sm grid grid-cols-2 md:grid-cols-7 gap-y-2 items-center text-sm hover:shadow-md transition"
            >
              <div className="font-medium text-gray-900">{tax.tax_type}</div>
              <div className="text-gray-600">{tax.tax_category}</div>
              <div className="text-gray-600">{tax.tax_rate}%</div>
              <div className="text-gray-500 text-xs">{tax.valid_from}</div>
              <div className="text-gray-500 text-xs">{tax.valid_to}</div>
              <div>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    tax.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {tax.status}
                </span>
              </div>
              <div className="flex justify-end gap-2 col-span-2 md:col-span-1">
                <IconButton
                  color="gray"
                  title="View"
                  onClick={() => navigate(`/taxation-management/view/${tax.id}`)}
                >
                  <FiEye />
                </IconButton>
                <IconButton
                  color="blue"
                  title="Edit"
                  onClick={() => setEditTax(tax)}
                >
                  <FiEdit3 />
                </IconButton>
                <IconButton color="red" title="Delete" onClick={() => handleDelete(tax.id)}>
                  <FiTrash2 />
                </IconButton>
              </div>
            </div>
          ))}

          {filteredTaxes.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm text-gray-400 text-sm">
              No tax entries found.
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <AddTaxModal onClose={() => setShowAddModal(false)} onSave={handleSaveNew} />
      )}
      {editTax && (
        <EditTaxModal
          tax={editTax}
          onClose={() => setEditTax(null)}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
};

export default TaxationManagement;

// ─── Add Tax Modal ─────────────────────────────────────────────────────────────
const AddTaxModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    tax_type: "",
    tax_category: "",
    tax_rate: "",
    valid_from: "",
    valid_to: "",
    status: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const getErrors = (f) => {
    const e = {};
    if (!f.tax_type) e.tax_type = "Tax type is required";
    if (!f.tax_category) e.tax_category = "Tax category is required";
    if (!f.tax_rate || Number(f.tax_rate) < 0) e.tax_rate = "Valid rate is required";
    if (!f.valid_from) e.valid_from = "Valid from date is required";
    if (!f.valid_to) e.valid_to = "Valid to date is required";
    if (!f.status) e.status = "Status is required";
    return e;
  };

  const errors = submitted ? getErrors(form) : {};
  const hasErrors = Object.keys(getErrors(form)).length > 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (hasErrors) return;
    setSaving(true);
    try {
      const newTax = await bankFundService.createTax(form);
      onSave(newTax || form);
    } catch (err) {
      console.error("Failed to create tax:", err);
      alert("Error creating tax");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Add Tax" subtitle="Configure a new tax type and rate" onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Tax Type" required error={errors.tax_type}>
          <select
            name="tax_type"
            value={form.tax_type}
            onChange={handleChange}
            className={inputClass(errors.tax_type)}
          >
            <option value="">— Select Tax Type —</option>
            {TAX_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>

        <FormField label="Tax Category" required error={errors.tax_category}>
          <select
            name="tax_category"
            value={form.tax_category}
            onChange={handleChange}
            className={inputClass(errors.tax_category)}
          >
            <option value="">— Select Category —</option>
            {TAX_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>

        <FormField label="Rate (%)" required error={errors.tax_rate}>
          <input
            type="number"
            name="tax_rate"
            value={form.tax_rate}
            onChange={handleChange}
            placeholder="e.g. 18.00"
            step="0.01"
            min="0"
            max="100"
            className={inputClass(errors.tax_rate)}
          />
        </FormField>

        <FormField label="Status" required error={errors.status}>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className={inputClass(errors.status)}
          >
            <option value="">— Select Status —</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>

        <FormField label="Valid From" required error={errors.valid_from}>
          <input
            type="date"
            name="valid_from"
            value={form.valid_from}
            onChange={handleChange}
            className={inputClass(errors.valid_from)}
          />
        </FormField>

        <FormField label="Valid To" required error={errors.valid_to}>
          <input
            type="date"
            name="valid_to"
            value={form.valid_to}
            onChange={handleChange}
            className={inputClass(errors.valid_to)}
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
          disabled={saving}
          className={`px-5 py-2.5 rounded-xl text-white flex items-center gap-2 text-sm font-medium transition ${
            saving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <FiSave /> {saving ? "Saving..." : "Save Tax"}
        </button>
      </div>
    </ModalShell>
  );
};

// ─── Edit Tax Modal ────────────────────────────────────────────────────────────
const EditTaxModal = ({ tax, onClose, onSave }) => {
  const [form, setForm] = useState({
    tax_type: tax.tax_type || "",
    tax_category: tax.tax_category || "",
    tax_rate: tax.tax_rate || "",
    valid_from: tax.valid_from || "",
    valid_to: tax.valid_to || "",
    status: tax.status || "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const getErrors = (f) => {
    const e = {};
    if (!f.tax_type) e.tax_type = "Tax type is required";
    if (!f.tax_category) e.tax_category = "Tax category is required";
    if (!f.tax_rate || Number(f.tax_rate) < 0) e.tax_rate = "Valid rate is required";
    if (!f.valid_from) e.valid_from = "Valid from date is required";
    if (!f.valid_to) e.valid_to = "Valid to date is required";
    if (!f.status) e.status = "Status is required";
    return e;
  };

  const errors = submitted ? getErrors(form) : {};
  const hasErrors = Object.keys(getErrors(form)).length > 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (hasErrors) return;
    setSaving(true);
    try {
      await bankFundService.updateTax(tax.id, form);
      onSave(form);
    } catch (err) {
      console.error("Failed to update tax:", err);
      alert("Error updating tax");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Edit Tax" subtitle="Update tax type, rate and validity" onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Tax Type" required error={errors.tax_type}>
          <select
            name="tax_type"
            value={form.tax_type}
            onChange={handleChange}
            className={inputClass(errors.tax_type)}
          >
            <option value="">— Select Tax Type —</option>
            {TAX_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>

        <FormField label="Tax Category" required error={errors.tax_category}>
          <select
            name="tax_category"
            value={form.tax_category}
            onChange={handleChange}
            className={inputClass(errors.tax_category)}
          >
            <option value="">— Select Category —</option>
            {TAX_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>

        <FormField label="Rate (%)" required error={errors.tax_rate}>
          <input
            type="number"
            name="tax_rate"
            value={form.tax_rate}
            onChange={handleChange}
            step="0.01"
            min="0"
            max="100"
            className={inputClass(errors.tax_rate)}
          />
        </FormField>

        <FormField label="Status" required error={errors.status}>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className={inputClass(errors.status)}
          >
            <option value="">— Select Status —</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>

        <FormField label="Valid From" required error={errors.valid_from}>
          <input
            type="date"
            name="valid_from"
            value={form.valid_from}
            onChange={handleChange}
            className={inputClass(errors.valid_from)}
          />
        </FormField>

        <FormField label="Valid To" required error={errors.valid_to}>
          <input
            type="date"
            name="valid_to"
            value={form.valid_to}
            onChange={handleChange}
            className={inputClass(errors.valid_to)}
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
          disabled={saving}
          className={`px-5 py-2.5 rounded-xl text-white flex items-center gap-2 text-sm font-medium transition ${
            saving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <FiSave /> {saving ? "Updating..." : "Update Tax"}
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
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] flex flex-col">
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
  <div>
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