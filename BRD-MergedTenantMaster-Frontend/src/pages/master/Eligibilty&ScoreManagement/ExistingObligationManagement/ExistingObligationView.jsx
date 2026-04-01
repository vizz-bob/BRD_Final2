import React, { useEffect, useState } from "react";
import { FiArrowLeft, FiEdit } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import { obligationsManagementService } from "../../../../services/eligibilityManagementService";

/* ─── tiny helpers ─── */
const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
      {label}
    </p>
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
export default function ExistingObligationView() {
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
        const result = await obligationsManagementService.retrieve(id);
        setData(result);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load obligation details.");
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition shadow-sm"
          >
            <FiArrowLeft className="text-gray-700 text-xl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Existing Obligation Details
            </h1>
            <p className="text-gray-500 text-sm">
              View loan and credit card obligation
            </p>
          </div>
        </div>

        {/* Edit shortcut */}
        <button
          onClick={() => navigate(`/obligation/edit/${id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition shadow-sm"
        >
          <FiEdit />
          Edit
        </button>
      </div>

      {/* CARD */}
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── Loan Obligations ── */}
          <SectionHeader title="Loan Obligations" />

          <Field label="Status of Loan"    value={data.loan_status} />
          <Field label="Loan Performance"  value={data.loan_performance} />
          <Field label="Total Loans"       value={data.total_loans} />
          <Field label="EMI Amount"        value={data.emi_amount} />

          {/* ── Credit Card Obligations ── */}
          <SectionHeader title="Credit Card Obligations" />

          <Field label="Credit Card Status"      value={data.credit_card_status} />
          <Field label="Credit Card Performance" value={data.credit_card_performance} />
          <Field label="Card Type"               value={data.card_type || "—"} />

          {/* ── Rule & Status ── */}
          <SectionHeader title="Rule & Status" />

          {/* is_active as badge */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Status
            </p>
            <StatusBadge value={data.is_active} />
          </div>

          {/* ignore_rule as badge */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Ignore Rule
            </p>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                data.ignore_rule
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {data.ignore_rule ? "Yes — excluded from FOIR" : "No"}
            </span>
          </div>

          {/* ── Timestamps ── */}
          {(data.created_at || data.modified_at) && (
            <>
              <SectionHeader title="Audit" />
              {data.created_at && (
                <Field
                  label="Created At"
                  value={new Date(data.created_at).toLocaleString()}
                />
              )}
              {data.modified_at && (
                <Field
                  label="Last Modified"
                  value={new Date(data.modified_at).toLocaleString()}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}