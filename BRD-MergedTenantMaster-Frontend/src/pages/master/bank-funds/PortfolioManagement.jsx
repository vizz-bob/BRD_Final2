import React, { useState, useEffect } from "react";
import {
  FiPlus, FiEdit3, FiTrash2, FiSearch, FiEye, FiX, FiSave,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { bankFundService } from "../../../services/bankFundService";

const PORTFOLIO_TYPES = ["Retail", "MSME", "Housing"];

// ─── Main Component ────────────────────────────────────────────────────────────
const PortfolioManagement = () => {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [banksList, setBanksList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPortfolio, setEditPortfolio] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [allBanksRes, portfolioRes] = await Promise.all([
          bankFundService.getBanks(),
          bankFundService.getPortfolios(),
        ]);
        const allBanks = Array.isArray(allBanksRes)
          ? allBanksRes
          : allBanksRes?.results || [];
        const portfolioData = Array.isArray(portfolioRes)
          ? portfolioRes
          : portfolioRes?.results || [];

        setBanksList(allBanks);

        const portfoliosWithBankObjects = portfolioData.map((p) => ({
          ...p,
          banks: (Array.isArray(p.banks) ? p.banks : []).map(
            (bId) => allBanks.find((b) => b.id === bId) || { bank_name: "Unknown" }
          ),
        }));

        setPortfolios(portfoliosWithBankObjects);
      } catch (err) {
        console.error("Failed to fetch portfolios:", err);
        alert("Error fetching portfolios");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this portfolio?")) return;
    try {
      await bankFundService.deletePortfolio(id);
      setPortfolios((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete portfolio:", err);
      alert("Error deleting portfolio");
    }
  };

  const handleSaveNew = (newPortfolio) => {
    setPortfolios((prev) => [...prev, { id: Date.now(), ...newPortfolio }]);
    setShowAddModal(false);
  };

  const handleSaveEdit = (updated) => {
    setPortfolios((prev) =>
      prev.map((p) => (p.id === editPortfolio.id ? { ...p, ...updated } : p))
    );
    setEditPortfolio(null);
  };

  const filteredPortfolios = portfolios.filter(
    (p) =>
      p.portfolio_name.toLowerCase().includes(search.toLowerCase()) ||
      p.portfolio_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* HEADER — pt-2 for breathing room */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 pt-2">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Portfolio Management</h1>
          <p className="text-sm text-gray-500">
            Group loans and map portfolios to bank accounts
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <FiPlus /> Add Portfolio
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-sm">
        <FiSearch className="text-gray-400 flex-shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by portfolio name or type..."
          className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading portfolios...</div>
      ) : (
        <div className="space-y-3">
          <div className="hidden md:grid grid-cols-6 bg-gray-100 rounded-xl px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
            <div>Portfolio Name</div>
            <div>Type</div>
            <div>Banks Mapped</div>
            <div>Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {filteredPortfolios.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl px-5 py-4 shadow-sm grid grid-cols-2 md:grid-cols-6 gap-y-2 items-center text-sm hover:shadow-md transition"
            >
              <div className="font-medium text-gray-900">{p.portfolio_name}</div>
              <div className="text-gray-600">{p.portfolio_type}</div>
              <div className="text-gray-500 text-xs truncate">
                {p.banks?.map((b) => b.bank_name).join(", ") || "—"}
              </div>
              <div>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    p.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {p.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex justify-end gap-2 col-span-2">
                <IconButton
                  color="gray"
                  title="View"
                  onClick={() => navigate(`/portfolio-management/view/${p.id}`)}
                >
                  <FiEye />
                </IconButton>
                <IconButton
                  color="blue"
                  title="Edit"
                  onClick={() => setEditPortfolio(p)}
                >
                  <FiEdit3 />
                </IconButton>
                <IconButton color="red" title="Delete" onClick={() => handleDelete(p.id)}>
                  <FiTrash2 />
                </IconButton>
              </div>
            </div>
          ))}

          {filteredPortfolios.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm text-gray-400 text-sm">
              No portfolios found.
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <AddPortfolioModal
          banksList={banksList}
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveNew}
        />
      )}
      {editPortfolio && (
        <EditPortfolioModal
          portfolio={editPortfolio}
          banksList={banksList}
          onClose={() => setEditPortfolio(null)}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
};

export default PortfolioManagement;

// ─── Add Portfolio Modal ───────────────────────────────────────────────────────
const AddPortfolioModal = ({ banksList, onClose, onSave }) => {
  const [form, setForm] = useState({
    portfolio_name: "",
    portfolio_type: "",
    banks: [],
    is_active: true,
  });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const getErrors = (f) => {
    const e = {};
    if (!f.portfolio_name.trim()) e.portfolio_name = "Portfolio name is required";
    if (!f.portfolio_type) e.portfolio_type = "Portfolio type is required";
    return e;
  };

  const errors = submitted ? getErrors(form) : {};
  const hasErrors = Object.keys(getErrors(form)).length > 0;

  const toggleBank = (bankId) => {
    setForm((prev) => ({
      ...prev,
      banks: prev.banks.includes(bankId)
        ? prev.banks.filter((b) => b !== bankId)
        : [...prev.banks, bankId],
    }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (hasErrors) return;
    setSaving(true);
    try {
      await bankFundService.createPortfolio(form);
      onSave({
        portfolio_name: form.portfolio_name,
        portfolio_type: form.portfolio_type,
        banks: form.banks.map((id) => banksList.find((b) => b.id === id) || { bank_name: "Unknown" }),
        is_active: form.is_active,
      });
    } catch (err) {
      console.error("Failed to create portfolio:", err);
      alert("Error creating portfolio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Add Portfolio" subtitle="Create a new portfolio and map banks" onClose={onClose}>
      <FormField label="Portfolio Name" required error={errors.portfolio_name}>
        <input
          type="text"
          value={form.portfolio_name}
          onChange={(e) => setForm((prev) => ({ ...prev, portfolio_name: e.target.value }))}
          placeholder="e.g. Retail Loan Portfolio"
          className={inputClass(errors.portfolio_name)}
        />
      </FormField>

      <FormField label="Portfolio Type" required error={errors.portfolio_type}>
        <select
          value={form.portfolio_type}
          onChange={(e) => setForm((prev) => ({ ...prev, portfolio_type: e.target.value }))}
          className={inputClass(errors.portfolio_type)}
        >
          <option value="">— Select Type —</option>
          {PORTFOLIO_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Map Banks">
        <div className="grid grid-cols-2 gap-2 mt-1">
          {banksList.length ? (
            banksList.map((bank) => (
              <label key={bank.id} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.banks.includes(bank.id)}
                  onChange={() => toggleBank(bank.id)}
                  className="accent-blue-600"
                />
                {bank.bank_name}
              </label>
            ))
          ) : (
            <p className="text-gray-400 text-sm col-span-2">Loading banks...</p>
          )}
        </div>
      </FormField>

      <FormField label="Status">
        <label className="flex items-center gap-2 text-sm text-gray-700 mt-1">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
            className="accent-blue-600"
          />
          Active
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
          <FiSave /> {saving ? "Saving..." : "Save Portfolio"}
        </button>
      </div>
    </ModalShell>
  );
};

// ─── Edit Portfolio Modal ──────────────────────────────────────────────────────
const EditPortfolioModal = ({ portfolio, banksList, onClose, onSave }) => {
  const [form, setForm] = useState({
    portfolio_name: portfolio.portfolio_name || "",
    portfolio_type: portfolio.portfolio_type || "",
    banks: portfolio.banks?.map((b) => b.id).filter(Boolean) || [],
    is_active: portfolio.is_active ?? true,
  });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const getErrors = (f) => {
    const e = {};
    if (!f.portfolio_name.trim()) e.portfolio_name = "Portfolio name is required";
    if (!f.portfolio_type) e.portfolio_type = "Portfolio type is required";
    return e;
  };

  const errors = submitted ? getErrors(form) : {};
  const hasErrors = Object.keys(getErrors(form)).length > 0;

  const toggleBank = (bankId) => {
    setForm((prev) => ({
      ...prev,
      banks: prev.banks.includes(bankId)
        ? prev.banks.filter((b) => b !== bankId)
        : [...prev.banks, bankId],
    }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (hasErrors) return;
    setSaving(true);
    try {
      await bankFundService.updatePortfolio(portfolio.id, form);
      onSave({
        portfolio_name: form.portfolio_name,
        portfolio_type: form.portfolio_type,
        banks: form.banks.map((id) => banksList.find((b) => b.id === id) || { bank_name: "Unknown" }),
        is_active: form.is_active,
      });
    } catch (err) {
      console.error("Failed to update portfolio:", err);
      alert("Error updating portfolio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Edit Portfolio" subtitle="Update portfolio details and bank mapping" onClose={onClose}>
      <FormField label="Portfolio Name" required error={errors.portfolio_name}>
        <input
          type="text"
          value={form.portfolio_name}
          onChange={(e) => setForm((prev) => ({ ...prev, portfolio_name: e.target.value }))}
          className={inputClass(errors.portfolio_name)}
        />
      </FormField>

      <FormField label="Portfolio Type" required error={errors.portfolio_type}>
        <select
          value={form.portfolio_type}
          onChange={(e) => setForm((prev) => ({ ...prev, portfolio_type: e.target.value }))}
          className={inputClass(errors.portfolio_type)}
        >
          <option value="">— Select Type —</option>
          {PORTFOLIO_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Mapped Banks">
        <div className="grid grid-cols-2 gap-2 mt-1">
          {banksList.length ? (
            banksList.map((bank) => (
              <label key={bank.id} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.banks.includes(bank.id)}
                  onChange={() => toggleBank(bank.id)}
                  className="accent-blue-600"
                />
                {bank.bank_name}
              </label>
            ))
          ) : (
            <p className="text-gray-400 text-sm col-span-2">No banks available</p>
          )}
        </div>
      </FormField>

      <FormField label="Status">
        <label className="flex items-center gap-2 text-sm text-gray-700 mt-1">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
            className="accent-blue-600"
          />
          Active
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
          <FiSave /> {saving ? "Updating..." : "Update Portfolio"}
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