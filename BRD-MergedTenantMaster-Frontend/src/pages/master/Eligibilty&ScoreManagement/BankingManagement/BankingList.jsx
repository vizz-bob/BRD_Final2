import React, { useEffect, useState } from "react";
import { FiPlus, FiEye, FiEdit, FiTrash2, FiX, FiSave, FiUpload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import {
  PageHeader,
  SearchFilterBar,
  ListView,
  DeleteConfirmButton,
  SelectField,
  InputField,
} from "../../../../components/master/Controls/SharedUIHelpers";

import { bankingManagementService } from "../../../../services/eligibilityManagementService";

/* ===== OPTIONS ===== */
const BANK_ACCOUNT_TYPE_OPTIONS = [
  { label: "Savings",   value: "Savings" },
  { label: "Current",   value: "Current" },
  { label: "Overdraft", value: "Overdraft" },
  { label: "NODAL",     value: "NODAL" },
  { label: "Escrow",    value: "Escrow" },
];

const AVERAGE_BANKING_CRITERIA_OPTIONS = [
  { label: "Average Balance", value: "Average Balance" },
  { label: "Credits",         value: "Credits" },
  { label: "Debits",          value: "Debits" },
];

const AVERAGE_BALANCE_FREQUENCY_OPTIONS = [
  { label: "Daily",   value: "Daily" },
  { label: "Weekly",  value: "Weekly" },
  { label: "Monthly", value: "Monthly" },
];

const STATUS_OPTIONS = [
  { label: "Active",   value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

/* ===== SECTION HEADER ===== */
const SectionHeader = ({ title }) => (
  <div className="col-span-1 sm:col-span-2 mt-1">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
      {title}
    </p>
    <hr />
  </div>
);

/* ===== TOGGLE FIELD ===== */
const ToggleField = ({ label, name, checked, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="flex items-center gap-3 mt-1">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange({ target: { name, value: !checked } })}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span className="text-sm text-gray-600">{checked ? "Enabled" : "Disabled"}</span>
    </div>
  </div>
);

/* ===== FILE UPLOAD FIELD ===== */
const FileUploadField = ({ label, name, onChange, accept }) => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onChange({ target: { name, value: file } });
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <label className="flex items-center gap-3 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
        <FiUpload className="text-gray-400 shrink-0" />
        <span className="text-sm text-gray-500 truncate">
          {fileName || "Click to upload PDF"}
        </span>
        <input
          type="file"
          name={name}
          accept={accept || ".pdf"}
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  );
};

/* ═══════════ EMPTY FORM ═══════════ */
const EMPTY_FORM = {
  bank_account_type:          "",
  average_banking_criteria:   "",
  average_banking_from:       "",
  average_banking_to:         "",
  is_active:                  true,
  average_balance_frequency:  "",
  account_aggregator_enabled: false,
  bank_statement_pdf:         null,
};

/* ═══════════ MODAL ═══════════ */
function BankingModal({ isEdit = false, editId = null, onClose, onSaved }) {
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!isEdit || !editId) return;
    (async () => {
      setLoading(true);
      try {
        const data = await bankingManagementService.retrieve(editId);
        if (data) {
          setForm({
            bank_account_type:          data.bank_account_type || "",
            average_banking_criteria:   data.average_banking_criteria || "",
            average_banking_from:       data.average_banking_from || "",
            average_banking_to:         data.average_banking_to || "",
            is_active:                  data.is_active ?? true,
            average_balance_frequency:  data.average_balance_frequency || "",
            account_aggregator_enabled: data.account_aggregator_enabled ?? false,
            bank_statement_pdf:         null,
          });
        }
      } catch (err) {
        console.error("Failed to load banking rule", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "is_active") {
      setForm((p) => ({ ...p, is_active: value === "Active" }));
      return;
    }
    if (name === "account_aggregator_enabled") {
      setForm((p) => ({ ...p, account_aggregator_enabled: Boolean(value) }));
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const hasPdf = form.bank_statement_pdf instanceof File;
    let payload;

    if (hasPdf) {
      payload = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined) payload.append(k, v);
      });
    } else {
      const { bank_statement_pdf, ...rest } = form;
      payload = rest;
    }

    try {
      if (isEdit && editId) {
        await bankingManagementService.update(editId, payload);
      } else {
        await bankingManagementService.create(payload);
      }
      onSaved();
    } catch (err) {
      console.error("Error saving banking rule", err);
      setError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl mx-0 sm:mx-4 max-h-[92vh] sm:max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-4 sm:px-7 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEdit ? "Edit Banking Rule" : "Add Banking Rule"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEdit ? "Update banking eligibility criteria" : "Create a new banking eligibility rule"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-4 sm:px-7 py-5 flex-1">
          <form
            id="banking-modal-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5"
          >
            <SectionHeader title="Core Banking Eligibility" />

            <SelectField
              label="Bank Account Type"
              name="bank_account_type"
              value={form.bank_account_type}
              onChange={handleChange}
              options={BANK_ACCOUNT_TYPE_OPTIONS}
              placeholder="Select account type"
              required
            />

            <SelectField
              label="Average Banking Criteria"
              name="average_banking_criteria"
              value={form.average_banking_criteria}
              onChange={handleChange}
              options={AVERAGE_BANKING_CRITERIA_OPTIONS}
              placeholder="Select criteria"
              required
            />

            <InputField
              label="Average Banking From"
              name="average_banking_from"
              type="date"
              value={form.average_banking_from}
              onChange={handleChange}
              required
            />

            <InputField
              label="Average Banking To"
              name="average_banking_to"
              type="date"
              value={form.average_banking_to}
              onChange={handleChange}
              required
            />

            <SelectField
              label="Status"
              name="is_active"
              value={form.is_active ? "Active" : "Inactive"}
              onChange={handleChange}
              options={STATUS_OPTIONS}
              required
            />

            <SectionHeader title="Automated Analysis & Frequency" />

            <SelectField
              label="Average Balance Frequency"
              name="average_balance_frequency"
              value={form.average_balance_frequency}
              onChange={handleChange}
              options={AVERAGE_BALANCE_FREQUENCY_OPTIONS}
              placeholder="Select frequency"
            />

            <ToggleField
              label="Account Aggregator Enabled"
              name="account_aggregator_enabled"
              checked={form.account_aggregator_enabled}
              onChange={handleChange}
            />

            <div className="col-span-1 sm:col-span-2">
              <FileUploadField
                label="Upload Bank Statement (PDF)"
                name="bank_statement_pdf"
                onChange={handleChange}
                accept=".pdf"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-7 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="banking-modal-form"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <FiSave size={14} />
              {loading ? "Saving…" : isEdit ? "Update Banking Rule" : "Save Banking Rule"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════ LIST PAGE ═══════════════════ */
export default function BankingList() {
  const navigate = useNavigate();

  const [data,      setData]      = useState([]);
  const [search,    setSearch]    = useState("");
  const [deleteRow, setDeleteRow] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId,    setEditId]    = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const res = await bankingManagementService.list();
    setData(Array.isArray(res) ? res : (res?.results || []));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd     = ()    => { setEditId(null); setModalOpen(true); };
  const openEdit    = (row) => { setEditId(row.id); setModalOpen(true); };
  const closeModal  = ()    => { setModalOpen(false); setEditId(null); };
  const handleSaved = async () => { closeModal(); await fetchData(); };

  const handleDelete = async () => {
    if (!deleteRow) return;
    setLoading(true);
    await bankingManagementService.delete(deleteRow.id);
    setDeleteRow(null);
    await fetchData();
    setLoading(false);
  };

  const filteredData = data.filter((row) =>
    row.bank_account_type?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: "bank_account_type",        label: "Account Type" },
    { key: "average_banking_from",     label: "Avg From"     },
    { key: "average_banking_to",       label: "Avg To"       },
    { key: "average_banking_criteria", label: "Criteria"     },
    { key: "is_active",                label: "Status", type: "status" },
  ];

  const actions = [
    {
      icon: <FiEye />,
      color: "gray",
      onClick: (row) => navigate(`/banking/view/${row.id}`),
    },
    {
      icon: <FiEdit />,
      color: "blue",
      onClick: (row) => openEdit(row),
    },
    {
      icon: <FiTrash2 />,
      color: "red",
      onClick: (row) => setDeleteRow(row),
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Banking Management"
        subtitle="Manage banking eligibility rules"
        actionLabel="Add Banking Rule"
        actionIcon={<FiPlus />}
        onAction={openAdd}
      />

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search account type..."
      />

      <ListView
        data={filteredData}
        columns={columns}
        actions={actions}
        rowKey="id"
      />

      {!loading && filteredData.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-6">
          No banking rules found
        </p>
      )}

      {deleteRow && (
        <DeleteConfirmButton
          title="Delete Banking Rule"
          message="Are you sure you want to delete this banking rule?"
          confirmText="Delete"
          loading={loading}
          onCancel={() => setDeleteRow(null)}
          onConfirm={handleDelete}
        />
      )}

      {modalOpen && (
        <BankingModal
          isEdit={!!editId}
          editId={editId}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}