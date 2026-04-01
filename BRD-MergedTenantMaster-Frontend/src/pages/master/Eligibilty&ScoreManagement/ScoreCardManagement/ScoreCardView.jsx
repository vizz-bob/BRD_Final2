import React, { useEffect, useState } from "react";
import { FiArrowLeft, FiEdit } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import { scoreCardManagementService } from "../../../../services/eligibilityManagementService";

/* ─── helpers ─── */
const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
    <p className="text-sm font-medium text-gray-800">
      {value !== null && value !== undefined && value !== "" ? String(value) : "—"}
    </p>
  </div>
);

const SectionHeader = ({ title }) => (
  <div className="md:col-span-2 mt-2">
    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
      {title}
    </h2>
    <hr />
  </div>
);

const StatusBadge = ({ value }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
    }`}
  >
    {value ? "Active" : "Inactive"}
  </span>
);

/* ═══════════════════ MAIN ═══════════════════ */
export default function ScoreCardView() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await scoreCardManagementService.retrieve(id);
        setData(result);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load score card details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /* ── loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  /* ── error ── */
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <p className="text-red-500 text-sm">{error || "No data found."}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  /* ── view ── */
  return (
    <>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition shadow-sm"
          >
            <FiArrowLeft className="text-gray-700 text-xl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Score Card Details</h1>
            <p className="text-gray-500 text-sm">View score card configuration</p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/score-card/edit/${id}`)} // ← fixed route
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition shadow-sm"
        >
          <FiEdit />
          Edit
        </button>
      </div>

      {/* CARD */}
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── Core Configuration ── */}
          <SectionHeader title="Core Scorecard Configuration" />
          <Field label="Impact Type" value={data.impact_type} />
          <Field label="Risk Impact"  value={data.risk_impact} />

          {/* ── Segment Scores ── */}
          <SectionHeader title="Segment Scores" />
          <Field label="Professionals Score" value={data.professionals_config?.score} />
          <Field label="Employees Score"     value={data.employees_config?.score} />
          <Field label="Groups Score"        value={data.groups_config?.score} />
          <Field label="Corporates Score"    value={data.corporates_config?.score} />
          <Field label="Others Score"        value={data.others_config?.score} />

          {/* ── Credit History ── */}
          <SectionHeader title="Credit History Parameters" />
          <Field label="Credit Bureau"          value={data.credit_bureau} />
          <Field label="Credit Score"           value={data.credit_score} />
          <Field label="Delayed Payments"       value={data.delayed_payments} />
          <Field label="Write-offs & Settlements" value={data.write_offs_settlements} />
          <Field label="No. of Enquiries"       value={data.no_of_enquiries} />

          {/* ── Reference & Investigation ── */}
          <SectionHeader title="Reference & Investigation" />
          <Field label="Reference Check Criteria"  value={data.reference_check_criteria} />
          <Field label="Reference Rating Scale"    value={data.reference_rating_scale} />
          <Field label="Investigation Report Type" value={data.investigation_report_type} />
          <Field label="Investigation Outcome"     value={data.investigation_outcome} />

          {/* PDF link if available */}
          {data.investigation_report_pdf && (
            <div className="md:col-span-2">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                Investigation Report
              </p>
              <a
                href={data.investigation_report_pdf}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View PDF
              </a>
            </div>
          )}

          {/* ── Geographic & Internal ── */}
          <SectionHeader title="Geographic & Internal Logic" />
          <Field label="Geo Location"   value={data.geo_location} />
          <Field label="Internal Score" value={data.internal_score} />

          {/* ── Status ── */}
          <SectionHeader title="Status" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Status</p>
            <StatusBadge value={data.is_active} />
          </div>

          {/* ── Audit ── */}
          {(data.version_number || data.created_at || data.updated_at) && (
            <>
              <SectionHeader title="Audit Information" />
              {data.version_number && (
                <Field label="Version Number" value={data.version_number} />
              )}
              {data.created_at && (
                <Field label="Created At" value={new Date(data.created_at).toLocaleString()} />
              )}
              {data.updated_at && (
                <Field label="Last Updated" value={new Date(data.updated_at).toLocaleString()} />
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
}