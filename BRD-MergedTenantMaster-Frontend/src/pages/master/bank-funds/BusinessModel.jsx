import React, { useState, useEffect } from "react";
import {
  FiPlus, FiEdit3, FiTrash2, FiSearch, FiEye, FiSave, FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { bankFundService } from "../../../services/bankFundService";

const MODEL_TYPES = [
  "Mark-up Model",
  "Payout Model",
  "Lease Model",
  "Co-Lending Model",
];
const STATUS_OPTIONS = ["ACTIVE", "INACTIVE"];

// ─── Main Component ────────────────────────────────────────────────────────────
const BusinessModel = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editModel, setEditModel] = useState(null);
  const [partnersList, setPartnersList] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [modelsData, partnersData] = await Promise.all([
        bankFundService.getBusinessModels(),
        bankFundService.getAgents().catch(() => []),
      ]);
      setModels(Array.isArray(modelsData) ? modelsData : modelsData?.results || []);
      setPartnersList(Array.isArray(partnersData) ? partnersData : partnersData?.results || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      alert("Failed to fetch business models");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this business model?")) return;
    try {
      await bankFundService.deleteBusinessModel(id);
      setModels((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to delete business model:", err);
      alert("Error deleting business model");
    }
  };

  const handleSaveNew = (newModel) => {
    setModels((prev) => [...prev, { id: Date.now(), ...newModel }]);
    setShowAddModal(false);
  };

  const handleSaveEdit = (updated) => {
    setModels((prev) =>
      prev.map((m) => (m.id === editModel.id ? { ...m, ...updated } : m))
    );
    setEditModel(null);
  };

  const filteredModels = (Array.isArray(models) ? models : []).filter(
    (m) =>
      (m?.model_type || "").toLowerCase().includes(search.toLowerCase()) ||
      (m?.model_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (m?.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* HEADER — pt-2 for breathing room */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 pt-2">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Business Models</h1>
          <p className="text-sm text-gray-500">Configure financial engagement models</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <FiPlus /> Add Model
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-sm">
        <FiSearch className="text-gray-400 flex-shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search business model..."
          className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading...</div>
      ) : (
        <div className="space-y-3">
          <div className="hidden md:grid grid-cols-6 bg-gray-100 rounded-xl px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
            <div>Model Name</div>
            <div>Model Type</div>
            <div className="col-span-2">Description</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          {filteredModels.map((model) => (
            <div
              key={model.id}
              className="bg-white rounded-2xl px-5 py-4 shadow-sm grid grid-cols-2 md:grid-cols-6 gap-y-2 items-center text-sm hover:shadow-md transition"
            >
              <div className="font-medium text-gray-900">{model.model_name}</div>
              <div className="text-gray-600">{model.model_type}</div>
              <div className="text-gray-500 md:col-span-2 text-xs truncate">
                {model.description || "—"}
              </div>
              <div>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    model.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {model.status}
                </span>
              </div>
              <div className="flex justify-end gap-2 col-span-2 md:col-span-1">
                <IconButton
                  color="gray"
                  title="View"
                  onClick={() => navigate(`/business-model/view/${model.id}`)}
                >
                  <FiEye />
                </IconButton>
                <IconButton
                  color="blue"
                  title="Edit"
                  onClick={() => setEditModel(model)}
                >
                  <FiEdit3 />
                </IconButton>
                <IconButton color="red" title="Delete" onClick={() => handleDelete(model.id)}>
                  <FiTrash2 />
                </IconButton>
              </div>
            </div>
          ))}

          {filteredModels.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm text-gray-400 text-sm">
              No business models found.
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <BusinessModelModal
          mode="add"
          partnersList={partnersList}
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveNew}
        />
      )}
      {editModel && (
        <BusinessModelModal
          mode="edit"
          model={editModel}
          partnersList={partnersList}
          onClose={() => setEditModel(null)}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
};

export default BusinessModel;

// ─── Shared Add / Edit Modal ───────────────────────────────────────────────────
const BusinessModelModal = ({ mode, model, partnersList, onClose, onSave }) => {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    model_name:      model?.model_name      || "",
    model_type:      model?.model_type      || "",
    revenue_value:   model?.revenue_value   || "",
    linked_partners: model?.linked_partners || [],
    description:     model?.description     || "",
    status:          model?.status          || "ACTIVE",
  });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const getErrors = (f) => {
    const e = {};
    if (!f.model_name.trim()) e.model_name = "Model name is required";
    if (!f.model_type) e.model_type = "Model type is required";
    if (!f.revenue_value || Number(f.revenue_value) < 0)
      e.revenue_value = "Valid revenue value is required";
    if (!f.status) e.status = "Status is required";
    return e;
  };

  const errors = submitted ? getErrors(form) : {};
  const hasErrors = Object.keys(getErrors(form)).length > 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const togglePartner = (partnerId) => {
    setForm((prev) => ({
      ...prev,
      linked_partners: prev.linked_partners.includes(partnerId)
        ? prev.linked_partners.filter((p) => p !== partnerId)
        : [...prev.linked_partners, partnerId],
    }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (hasErrors) return;
    setSaving(true);
    try {
      if (isEdit) {
        await bankFundService.updateBusinessModel(model.id, form);
      } else {
        await bankFundService.createBusinessModel(form);
      }
      onSave(form);
    } catch (err) {
      console.error("Error saving business model:", err);
      alert("Failed to save business model");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title={isEdit ? "Edit Business Model" : "Add Business Model"}
      subtitle="Configure financial engagement model details"
      onClose={onClose}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model Name */}
        <FormField label="Model Name" required error={errors.model_name}>
          <input
            type="text"
            name="model_name"
            value={form.model_name}
            onChange={handleChange}
            placeholder="e.g. Gold Loan Mark-up FY25"
            className={inputClass(errors.model_name)}
          />
        </FormField>

        {/* Model Type */}
        <FormField label="Model Type" required error={errors.model_type}>
          <select
            name="model_type"
            value={form.model_type}
            onChange={handleChange}
            className={inputClass(errors.model_type)}
          >
            <option value="">— Select Type —</option>
            {MODEL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>

        {/* Revenue Value */}
        <FormField label="Revenue Share / Margin Value (%)" required error={errors.revenue_value}>
          <input
            type="number"
            name="revenue_value"
            value={form.revenue_value}
            onChange={handleChange}
            placeholder="e.g. 2.50"
            step="0.01"
            min="0"
            max="100"
            className={inputClass(errors.revenue_value)}
          />
        </FormField>

        {/* Status */}
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

        {/* Linked Partners — only show if available */}
        {partnersList.length > 0 && (
          <FormField label="Linked Partner / DSA" className="md:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
              {partnersList.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.linked_partners.includes(p.id)}
                    onChange={() => togglePartner(p.id)}
                    className="accent-blue-600"
                  />
                  {p.name || p.agent_name || p.id}
                </label>
              ))}
            </div>
          </FormField>
        )}

        {/* Description — full width */}
        <FormField label="Model Description" className="md:col-span-2">
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Define the engagement logic for this model..."
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
          disabled={saving}
          className={`px-5 py-2.5 rounded-xl text-white flex items-center gap-2 text-sm font-medium transition ${
            saving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <FiSave /> {saving ? "Saving..." : isEdit ? "Update Model" : "Save Model"}
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

const IconButton = ({ children, onClick, color, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded-full bg-${color}-100 hover:bg-${color}-200 transition`}
  >
    <span className={`text-${color}-600`}>{children}</span>
  </button>
);