import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiEye, FiEdit, FiTrash2, FiX, FiSave } from "react-icons/fi";

/* ===== SERVICES ===== */
import { obligationsManagementService } from "../../../../services/eligibilityManagementService";

/* ===== SHARED UI ===== */
import {
  PageHeader,
  ListView,
  SearchFilterBar,
  DeleteConfirmButton,
  SelectField,
  InputField,
} from "../../../../components/master/Controls/SharedUIHelpers";

/* ═══════════════════ OPTIONS ═══════════════════ */
const LOAN_STATUS_OPTIONS = [
  { label: "Active",      value: "Active" },
  { label: "Closed",      value: "Closed" },
  { label: "Settled",     value: "Settled" },
  { label: "Defaulted",   value: "Defaulted" },
  { label: "Written Off", value: "Written Off" },
  { label: "NPA",         value: "NPA" },
];

const LOAN_PERFORMANCE_OPTIONS = [
  { label: "Good",    value: "Good" },
  { label: "Average", value: "Average" },
  { label: "Poor",    value: "Poor" },
];

const CREDIT_CARD_STATUS_OPTIONS = [
  { label: "Active",     value: "Active" },
  { label: "Closed",     value: "Closed" },
  { label: "Delinquent", value: "Delinquent" },
];

const CREDIT_CARD_PERFORMANCE_OPTIONS = [
  { label: "Good",             value: "Good" },
  { label: "Delayed Payments", value: "Delayed Payments" },
  { label: "Overlimit",        value: "Overlimit" },
];

const CARD_TYPE_OPTIONS = [
  { label: "Credit Card", value: "Credit Card" },
  { label: "Charge Card", value: "Charge Card" },
  { label: "Store Card",  value: "Store Card" },
];

const STATUS_OPTIONS = [
  { label: "Active",   value: "true" },
  { label: "Inactive", value: "false" },
];

/* ═══════════════════ SECTION HEADER ═══════════════════ */
const SectionHeader = ({ title }) => (
  <div className="col-span-1 sm:col-span-2 mt-1">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
      {title}
    </p>
    <hr />
  </div>
);

/* ═══════════════════ TOGGLE FIELD ═══════════════════ */
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
      <span className="text-sm text-gray-600">{checked ? "Yes" : "No"}</span>
    </div>
  </div>
);

/* ═══════════════════ EMPTY FORM ═══════════════════ */
const EMPTY_FORM = {
  loan_status:             "",
  loan_performance:        "",
  total_loans:             "",
  emi_amount:              "",
  credit_card_status:      "",
  credit_card_performance: "",
  is_active:               true,
  card_type:               "",
  ignore_rule:             false,
};

/* ═══════════════════ MODAL ═══════════════════ */
function ObligationModal({ isEdit = false, editId = null, onClose, onSaved }) {
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  /* load for edit */
  useEffect(() => {
    if (!isEdit || !editId) return;
    (async () => {
      setLoading(true);
      try {
        const data = await obligationsManagementService.retrieve(editId);
        if (data) {
          setForm({
            loan_status:             data.loan_status || "",
            loan_performance:        data.loan_performance || "",
            total_loans:             data.total_loans ?? "",
            emi_amount:              data.emi_amount ?? "",
            credit_card_status:      data.credit_card_status || "",
            credit_card_performance: data.credit_card_performance || "",
            is_active:               data.is_active ?? true,
            card_type:               data.card_type || "",
            ignore_rule:             data.ignore_rule ?? false,
          });
        }
      } catch (err) {
        console.error("Failed to load obligation", err);
        setError("Failed to load record. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "is_active") {
      setForm((p) => ({ ...p, is_active: value === "true" }));
      return;
    }
    if (name === "ignore_rule") {
      setForm((p) => ({ ...p, ignore_rule: Boolean(value) }));
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      total_loans: form.total_loans === "" ? null : Number(form.total_loans),
      emi_amount:  form.emi_amount  === "" ? null : Number(form.emi_amount),
    };

    try {
      if (isEdit && editId) {
        await obligationsManagementService.update(editId, payload);
      } else {
        await obligationsManagementService.create(payload);
      }
      onSaved();
    } catch (err) {
      console.error("Error saving obligation", err);
      if (err.response?.data && typeof err.response.data === "object") {
        const fieldErrors = err.response.data;
        setError(
          fieldErrors.non_field_errors?.join(" ") ||
          "Please fix the errors and try again."
        );
      } else if (err.message) {
        setError(`Network error: ${err.message}`);
      } else {
        setError("Failed to save. Please try again.");
      }
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
              {isEdit ? "Edit Obligation Rule" : "Add Obligation Rule"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEdit
                ? "Update loan and credit card obligation"
                : "Configure loan and credit card obligations"}
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
            id="obligation-modal-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5"
          >
            {/* Section 1: Loan Obligations */}
            <SectionHeader title="Loan Obligations" />

            <SelectField
              label="Status of Loan"
              name="loan_status"
              value={form.loan_status}
              onChange={handleChange}
              options={LOAN_STATUS_OPTIONS}
              placeholder="Select loan status"
              required
            />

            <SelectField
              label="Loan Performance"
              name="loan_performance"
              value={form.loan_performance}
              onChange={handleChange}
              options={LOAN_PERFORMANCE_OPTIONS}
              placeholder="Select performance"
              required
            />

            <InputField
              label="Total Loans"
              name="total_loans"
              type="number"
              value={form.total_loans}
              onChange={handleChange}
              placeholder="Count of active loans"
              required
            />

            <InputField
              label="EMI Amount"
              name="emi_amount"
              type="number"
              step="0.01"
              value={form.emi_amount}
              onChange={handleChange}
              placeholder="Monthly EMI commitment"
              required
            />

            {/* Section 2: Credit Card Obligations */}
            <SectionHeader title="Credit Card Obligations" />

            <SelectField
              label="Status of Credit Card"
              name="credit_card_status"
              value={form.credit_card_status}
              onChange={handleChange}
              options={CREDIT_CARD_STATUS_OPTIONS}
              placeholder="Select credit card status"
              required
            />

            <SelectField
              label="Credit Card Performance"
              name="credit_card_performance"
              value={form.credit_card_performance}
              onChange={handleChange}
              options={CREDIT_CARD_PERFORMANCE_OPTIONS}
              placeholder="Select performance"
              required
            />

            <SelectField
              label="Card Type"
              name="card_type"
              value={form.card_type}
              onChange={handleChange}
              options={CARD_TYPE_OPTIONS}
              placeholder="Select card type"
            />

            {/* Section 3: Rule & Status */}
            <SectionHeader title="Rule & Status" />

            <SelectField
              label="Status"
              name="is_active"
              value={form.is_active ? "true" : "false"}
              onChange={handleChange}
              options={STATUS_OPTIONS}
              required
            />

            <ToggleField
              label="Ignore Rule"
              name="ignore_rule"
              checked={form.ignore_rule}
              onChange={handleChange}
            />
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
              form="obligation-modal-form"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <FiSave size={14} />
              {loading ? "Saving…" : isEdit ? "Update Obligation" : "Save Obligation"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════ LIST PAGE ═══════════════════ */
export default function ExistingObligationList() {
  const navigate = useNavigate();

  const [list,      setList]      = useState([]);
  const [search,    setSearch]    = useState("");
  const [loading,   setLoading]   = useState(false);
  const [deleteId,  setDeleteId]  = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId,    setEditId]    = useState(null);

  /* Fetch */
  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await obligationsManagementService.list();
      setList(Array.isArray(data) ? data : (data?.results || []));
    } catch (err) {
      console.error("Failed to fetch obligations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  /* Handlers */
  const openAdd     = ()    => { setEditId(null); setModalOpen(true); };
  const openEdit    = (row) => { setEditId(row.id); setModalOpen(true); };
  const closeModal  = ()    => { setModalOpen(false); setEditId(null); };
  const handleSaved = async () => { closeModal(); await fetchList(); };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    await obligationsManagementService.delete(deleteId);
    setDeleteId(null);
    await fetchList();
    setLoading(false);
  };

  /* Filter */
  const filteredList = list.filter((item) =>
    item.loan_status?.toLowerCase().includes(search.toLowerCase())
  );

  /* Columns */
  const columns = [
    { key: "loan_status",       label: "Loan Status"       },
    { key: "loan_performance",  label: "Loan Performance"  },
    { key: "card_type",         label: "Card Type"         },
    { key: "total_loans",       label: "Total Loans"       },
    { key: "is_active",         label: "Status", type: "status" },
  ];

  const actions = [
    {
      icon: <FiEye />,
      color: "gray",
      onClick: (row) => navigate(`/obligation/view/${row.id}`),
    },
    {
      icon: <FiEdit />,
      color: "blue",
      onClick: (row) => openEdit(row),
    },
    {
      icon: <FiTrash2 />,
      color: "red",
      onClick: (row) => setDeleteId(row.id),
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Existing Obligation Management"
        subtitle="Manage existing loan obligations"
        actionLabel="Add Obligation Rule"
        actionIcon={<FiPlus />}
        onAction={openAdd}
      />

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by loan status..."
      />

      <ListView
        data={filteredList}
        columns={columns}
        actions={actions}
        rowKey="id"
      />

      {!loading && filteredList.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-6">
          No obligation rules found
        </p>
      )}

      {deleteId && (
        <DeleteConfirmButton
          title="Delete Obligation Rule"
          message="Are you sure you want to delete this obligation rule?"
          onCancel={() => setDeleteId(null)}
          onConfirm={confirmDelete}
          loading={loading}
        />
      )}

      {modalOpen && (
        <ObligationModal
          isEdit={!!editId}
          editId={editId}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}