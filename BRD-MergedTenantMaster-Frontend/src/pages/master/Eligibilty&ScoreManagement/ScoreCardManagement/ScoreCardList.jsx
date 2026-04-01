import React, { useEffect, useState } from "react";
import { FiPlus, FiEye, FiEdit, FiTrash2, FiX, FiSave, FiUpload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import {
  PageHeader,
  ListView,
  SearchFilterBar,
  DeleteConfirmButton,
  SelectField,
  InputField,
} from "../../../../components/master/Controls/SharedUIHelpers";

import { scoreCardManagementService } from "../../../../services/eligibilityManagementService";

/* ═══════════════════ OPTIONS ═══════════════════ */
const IMPACT_TYPE_OPTIONS = [
  { label: "Positive", value: "Positive" },
  { label: "Negative", value: "Negative" },
];

const RISK_IMPACT_OPTIONS = [
  { label: "Low",    value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High",   value: "High" },
];

const CREDIT_BUREAU_OPTIONS = [
  { label: "CIBIL",    value: "CIBIL" },
  { label: "Experian", value: "Experian" },
  { label: "Equifax",  value: "Equifax" },
  { label: "CRIF",     value: "CRIF" },
];

const REFERENCE_CHECK_CRITERIA_OPTIONS = [
  { label: "Employment", value: "Employment" },
  { label: "Address",    value: "Address" },
  { label: "Personal",   value: "Personal" },
];

const INVESTIGATION_REPORT_TYPE_OPTIONS = [
  { label: "Legal",     value: "Legal" },
  { label: "Technical", value: "Technical" },
  { label: "Fraud",     value: "Fraud" },
];

const INVESTIGATION_OUTCOME_OPTIONS = [
  { label: "Clean",   value: "Clean" },
  { label: "Flagged", value: "Flagged" },
  { label: "Pending", value: "Pending" },
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

/* ═══════════════════ FILE UPLOAD ═══════════════════ */
const FileUploadField = ({ label, name, onChange }) => {
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
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  );
};

/* ═══════════════════ EMPTY FORM ═══════════════════ */
const EMPTY_FORM = {
  impact_type:               "",
  risk_impact:               "",
  professionals:             "",
  employees:                 "",
  groups:                    "",
  corporates:                "",
  others:                    "",
  credit_bureau:             "",
  credit_score:              "",
  delayed_payments:          "",
  write_offs_settlements:    "",
  no_of_enquiries:           "",
  reference_check_criteria:  "",
  reference_rating_scale:    "",
  investigation_report_type: "",
  investigation_outcome:     "",
  investigation_report_pdf:  null,
  geo_location:              "",
  internal_score:            "",
  is_active:                 true,
};

/* ═══════════════════ MODAL ═══════════════════ */
function ScoreCardModal({ isEdit = false, editId = null, onClose, onSaved }) {
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  /* load for edit */
  useEffect(() => {
    if (!isEdit || !editId) return;
    (async () => {
      setLoading(true);
      try {
        const data = await scoreCardManagementService.retrieve(editId);
        if (data) {
          setForm({
            impact_type:               data.impact_type || "",
            risk_impact:               data.risk_impact || "",
            professionals:             data.professionals_config?.score ?? "",
            employees:                 data.employees_config?.score ?? "",
            groups:                    data.groups_config?.score ?? "",
            corporates:                data.corporates_config?.score ?? "",
            others:                    data.others_config?.score ?? "",
            credit_bureau:             data.credit_bureau || "",
            credit_score:              data.credit_score ?? "",
            delayed_payments:          data.delayed_payments ?? "",
            write_offs_settlements:    data.write_offs_settlements ?? "",
            no_of_enquiries:           data.no_of_enquiries ?? "",
            reference_check_criteria:  data.reference_check_criteria || "",
            reference_rating_scale:    data.reference_rating_scale ?? "",
            investigation_report_type: data.investigation_report_type || "",
            investigation_outcome:     data.investigation_outcome || "",
            investigation_report_pdf:  null,
            geo_location:              data.geo_location || "",
            internal_score:            data.internal_score ?? "",
            is_active:                 data.is_active ?? true,
          });
        }
      } catch (err) {
        console.error("Failed to load score card", err);
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
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const toNum = (v) =>
      v === "" || v === null || v === undefined ? undefined : Number(v);

    const hasPdf = form.investigation_report_pdf instanceof File;
    let payload;

    if (hasPdf) {
      payload = new FormData();
      const fields = {
        impact_type:               form.impact_type,
        risk_impact:               form.risk_impact,
        professionals_config:      JSON.stringify({ score: toNum(form.professionals) }),
        employees_config:          JSON.stringify({ score: toNum(form.employees) }),
        groups_config:             JSON.stringify({ score: toNum(form.groups) }),
        corporates_config:         JSON.stringify({ score: toNum(form.corporates) }),
        others_config:             JSON.stringify({ score: toNum(form.others) }),
        credit_bureau:             form.credit_bureau,
        credit_score:              toNum(form.credit_score),
        delayed_payments:          toNum(form.delayed_payments),
        write_offs_settlements:    toNum(form.write_offs_settlements),
        no_of_enquiries:           toNum(form.no_of_enquiries),
        reference_check_criteria:  form.reference_check_criteria,
        reference_rating_scale:    toNum(form.reference_rating_scale),
        investigation_report_type: form.investigation_report_type,
        investigation_outcome:     form.investigation_outcome,
        geo_location:              form.geo_location,
        internal_score:            toNum(form.internal_score),
        is_active:                 String(form.is_active),
      };
      Object.entries(fields).forEach(([k, v]) => {
        if (v !== null && v !== undefined) payload.append(k, v);
      });
      payload.append("investigation_report_pdf", form.investigation_report_pdf);
    } else {
      payload = {
        impact_type:               form.impact_type,
        risk_impact:               form.risk_impact,
        professionals_config:      { score: toNum(form.professionals) },
        employees_config:          { score: toNum(form.employees) },
        groups_config:             { score: toNum(form.groups) },
        corporates_config:         { score: toNum(form.corporates) },
        others_config:             { score: toNum(form.others) },
        credit_bureau:             form.credit_bureau,
        credit_score:              toNum(form.credit_score),
        delayed_payments:          toNum(form.delayed_payments),
        write_offs_settlements:    toNum(form.write_offs_settlements),
        no_of_enquiries:           toNum(form.no_of_enquiries),
        reference_check_criteria:  form.reference_check_criteria,
        reference_rating_scale:    toNum(form.reference_rating_scale),
        investigation_report_type: form.investigation_report_type,
        investigation_outcome:     form.investigation_outcome,
        geo_location:              form.geo_location,
        internal_score:            toNum(form.internal_score),
        is_active:                 form.is_active,
      };
    }

    try {
      if (isEdit && editId) {
        await scoreCardManagementService.update(editId, payload);
      } else {
        await scoreCardManagementService.create(payload);
      }
      onSaved();
    } catch (err) {
      console.error(
        "Save error [%d]:",
        err.response?.status,
        JSON.stringify(err.response?.data, null, 2) || err.message
      );
      if (err.response?.data?.non_field_errors) {
        setError(err.response.data.non_field_errors.join(" "));
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
        <div className="flex items-start justify-between px-4 sm:px-7 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEdit ? "Edit Score Card" : "Add Score Card"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEdit ? "Update score card configuration" : "Configure score card rules"}
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
            id="scorecard-modal-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5"
          >
            {/* ── Section 1: Core Configuration ── */}
            <SectionHeader title="Core Scorecard Configuration" />

            <SelectField
              label="Impact Type"
              name="impact_type"
              value={form.impact_type}
              onChange={handleChange}
              options={IMPACT_TYPE_OPTIONS}
              placeholder="Select impact type"
              required
            />

            <SelectField
              label="Risk Impact"
              name="risk_impact"
              value={form.risk_impact}
              onChange={handleChange}
              options={RISK_IMPACT_OPTIONS}
              placeholder="Select risk impact"
              required
            />

            <InputField
              label="Professionals Score"
              name="professionals"
              type="number"
              value={form.professionals}
              onChange={handleChange}
              placeholder="e.g. 80"
            />

            <InputField
              label="Employees Score"
              name="employees"
              type="number"
              value={form.employees}
              onChange={handleChange}
              placeholder="e.g. 75"
            />

            <InputField
              label="Groups Score"
              name="groups"
              type="number"
              value={form.groups}
              onChange={handleChange}
              placeholder="e.g. 70"
            />

            <InputField
              label="Corporates Score"
              name="corporates"
              type="number"
              value={form.corporates}
              onChange={handleChange}
              placeholder="e.g. 85"
            />

            <InputField
              label="Others Score"
              name="others"
              type="number"
              value={form.others}
              onChange={handleChange}
              placeholder="e.g. 60"
            />

            {/* ── Section 2: Credit History ── */}
            <SectionHeader title="Credit History Parameters" />

            <SelectField
              label="Credit Bureau"
              name="credit_bureau"
              value={form.credit_bureau}
              onChange={handleChange}
              options={CREDIT_BUREAU_OPTIONS}
              placeholder="Select bureau"
              required
            />

            <InputField
              label="Credit Score"
              name="credit_score"
              type="number"
              value={form.credit_score}
              onChange={handleChange}
              placeholder="e.g. 750"
              required
            />

            <InputField
              label="Delayed Payments"
              name="delayed_payments"
              type="number"
              value={form.delayed_payments}
              onChange={handleChange}
              placeholder="Count of overdue payments"
              required
            />

            <InputField
              label="Write-offs & Settlements"
              name="write_offs_settlements"
              type="number"
              value={form.write_offs_settlements}
              onChange={handleChange}
              placeholder="Count of write-offs"
              required
            />

            <InputField
              label="No. of Enquiries"
              name="no_of_enquiries"
              type="number"
              value={form.no_of_enquiries}
              onChange={handleChange}
              placeholder="Count of credit enquiries"
              required
            />

            {/* ── Section 3: Reference & Investigation ── */}
            <SectionHeader title="Reference & Investigation Ratings" />

            <SelectField
              label="Check Criteria (Reference)"
              name="reference_check_criteria"
              value={form.reference_check_criteria}
              onChange={handleChange}
              options={REFERENCE_CHECK_CRITERIA_OPTIONS}
              placeholder="Select criteria"
            />

            <InputField
              label="Rating Scale (Reference)"
              name="reference_rating_scale"
              type="number"
              min="0"
              max="100"
              value={form.reference_rating_scale}
              onChange={handleChange}
              placeholder="Score out of 100"
            />

            <SelectField
              label="Report Type (Investigation)"
              name="investigation_report_type"
              value={form.investigation_report_type}
              onChange={handleChange}
              options={INVESTIGATION_REPORT_TYPE_OPTIONS}
              placeholder="Select report type"
            />

            <SelectField
              label="Investigation Outcome"
              name="investigation_outcome"
              value={form.investigation_outcome}
              onChange={handleChange}
              options={INVESTIGATION_OUTCOME_OPTIONS}
              placeholder="Select outcome"
            />

            <div className="col-span-1 sm:col-span-2">
              <FileUploadField
                label="Upload Investigation Report (PDF)"
                name="investigation_report_pdf"
                onChange={handleChange}
              />
            </div>

            {/* ── Section 4: Geographic & Internal ── */}
            <SectionHeader title="Geographic & Internal Logic" />

            <InputField
              label="Geo Location"
              name="geo_location"
              value={form.geo_location}
              onChange={handleChange}
              placeholder="City, Pincode, or Blacklist Zone"
              required
            />

            <InputField
              label="Internal Score"
              name="internal_score"
              type="number"
              value={form.internal_score}
              onChange={handleChange}
              placeholder="Company-specific score value"
              required
            />

            {/* ── Section 5: Status ── */}
            <SectionHeader title="Status" />

            <SelectField
              label="Status"
              name="is_active"
              value={form.is_active ? "true" : "false"}
              onChange={handleChange}
              options={STATUS_OPTIONS}
              required
            />
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-7 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl shrink-0">
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
              form="scorecard-modal-form"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <FiSave size={14} />
              {loading ? "Saving…" : isEdit ? "Update Score Card" : "Save Score Card"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════ LIST PAGE ═══════════════════ */
export default function ScoreCardList() {
  const navigate = useNavigate();

  const [data,      setData]      = useState([]);
  const [search,    setSearch]    = useState("");
  const [deleteRow, setDeleteRow] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId,    setEditId]    = useState(null);

  /* Fetch */
  const fetchList = async () => {
    setLoading(true);
    const res = await scoreCardManagementService.list();
    setData(Array.isArray(res) ? res : (res?.results || []));
    setLoading(false);
  };

  useEffect(() => { fetchList(); }, []);

  /* Handlers */
  const openAdd     = ()    => { setEditId(null); setModalOpen(true); };
  const openEdit    = (row) => { setEditId(row.id); setModalOpen(true); };
  const closeModal  = ()    => { setModalOpen(false); setEditId(null); };
  const handleSaved = async () => { closeModal(); await fetchList(); };

  const handleDelete = async () => {
    if (!deleteRow) return;
    setLoading(true);
    await scoreCardManagementService.delete(deleteRow.id);
    setDeleteRow(null);
    await fetchList();
    setLoading(false);
  };

  /* Filter */
  const filtered = data.filter((i) =>
    i.impact_type?.toLowerCase().includes(search.toLowerCase())
  );

  /* Columns */
  const columns = [
    { key: "impact_type", label: "Impact Type" },
    { key: "risk_impact", label: "Risk Impact"  },
    { key: "is_active",   label: "Status", type: "status" },
  ];

  const actions = [
    {
      icon: <FiEye />,
      color: "gray",
      onClick: (row) => navigate(`/score-card/view/${row.id}`),
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
        title="Score Card Management"
        subtitle="Configure score card templates"
        actionLabel="Add Score Card"
        actionIcon={<FiPlus />}
        onAction={openAdd}
      />

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search impact type..."
      />

      <ListView
        data={filtered}
        rowKey="id"
        columns={columns}
        actions={actions}
      />

      {!loading && filtered.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-6">
          No score cards found
        </p>
      )}

      {deleteRow && (
        <DeleteConfirmButton
          title="Delete Score Card"
          message="Are you sure you want to delete this score card?"
          loading={loading}
          onCancel={() => setDeleteRow(null)}
          onConfirm={handleDelete}
        />
      )}

      {modalOpen && (
        <ScoreCardModal
          isEdit={!!editId}
          editId={editId}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}