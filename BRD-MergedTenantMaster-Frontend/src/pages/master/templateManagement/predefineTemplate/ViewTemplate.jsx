import React, { useEffect, useState } from "react";
import { FiArrowLeft, FiEdit3, FiDownload, FiFileText } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

// ─── Mock fetch (replace with real API) ──────────────────────────────────────
const fetchTemplateById = (id) => ({
  id,
  templateName: "Retail Loan Template",
  documentCategory: "Loan Agreement",
  language: "English",
  version: "v1.0",
  status: "Active",
  uploaded_by: "Admin",
  uploadedFileName: "retail_loan_template_v1.pdf",
  uploadedAt: "2025-01-15",
  fileSize: "245 KB",
});

// ─── Component ────────────────────────────────────────────────────────────────
const ViewTemplate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    setTemplate(fetchTemplateById(id));
  }, [id]);

  if (!template) return null;

  return (
    <>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
          >
            <FiArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Template Details</h1>
            <p className="text-sm text-gray-500">View all template information</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/predefine-template/edit/${id}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <FiEdit3 /> Edit Template
        </button>
      </div>

      {/* DETAILS CARD */}
      <div className="bg-white rounded-2xl shadow-sm max-w-2xl overflow-hidden">

        {/* Card header banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <FiFileText className="text-white text-2xl" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wide">
              Predefined Template
            </p>
            <h2 className="text-white text-lg font-semibold">{template.templateName}</h2>
          </div>
          <div className="ml-auto">
            <StatusBadge status={template.status} />
          </div>
        </div>

        {/* Detail rows */}
        <div className="divide-y divide-gray-100 px-6">
          <DetailRow label="Template Name" value={template.templateName} />
          <DetailRow label="Document Category" value={template.documentCategory} />
          <DetailRow label="Language" value={template.language} />

          {/* Version with mono badge */}
          <DetailRow
            label="Version"
            value={
              <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded-md text-gray-700">
                {template.version}
              </span>
            }
          />

          <DetailRow label="Uploaded By" value={template.uploaded_by} />
          <DetailRow label="Upload Date" value={template.uploadedAt} />

          {/* File download row */}
          <DetailRow
            label="Document File"
            value={
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FiFileText className="text-blue-500" />
                  <span>{template.uploadedFileName}</span>
                  <span className="text-xs text-gray-400">({template.fileSize})</span>
                </div>
                {/* In production, replace href with a real signed URL */}
                <button
                  onClick={() => console.log("Download:", template.uploadedFileName)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition"
                >
                  <FiDownload className="text-xs" /> Download
                </button>
              </div>
            }
          />

          <DetailRow
            label="Status"
            value={<StatusBadge status={template.status} variant="colored" />}
          />
        </div>

        {/* Immutable audit note */}
        <div className="mx-6 mb-6 mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-700">
            <strong>Immutable Audit Log:</strong> Any version changes are permanently recorded.
            Editing this template will increment the version number to maintain traceability.
          </p>
        </div>
      </div>
    </>
  );
};

export default ViewTemplate;

/* ─── HELPERS ─── */
const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-3.5 gap-4">
    <span className="text-sm text-gray-500 flex-shrink-0 w-40">{label}</span>
    <span className="text-sm text-gray-800 text-right">{value}</span>
  </div>
);

const StatusBadge = ({ status, variant }) => (
  <span
    className={`px-3 py-1 text-xs rounded-full font-medium ${
      status === "Active"
        ? variant === "colored"
          ? "bg-green-100 text-green-700"
          : "bg-white/30 text-white"
        : variant === "colored"
        ? "bg-red-100 text-red-600"
        : "bg-white/20 text-white/80"
    }`}
  >
    {status}
  </span>
);