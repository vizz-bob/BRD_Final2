import React, { useState, useEffect, useRef } from "react";
import { FiArrowLeft, FiSave, FiUpload, FiFile, FiX, FiInfo } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

// ─── Constants ────────────────────────────────────────────────────────────────
const LANGUAGES = [
  "English",
  "Hindi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Marathi",
  "Kannada",
  "Gujarati",
  "Malayalam",
  "Punjabi",
];

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
});

const bumpVersion = (version) => {
  const match = version?.match(/v(\d+)\.(\d+)/);
  if (!match) return "v2.0";
  return `v${parseInt(match[1]) + 1}.0`;
};

// ─── Component ────────────────────────────────────────────────────────────────
const EditTemplate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const [original, setOriginal] = useState(null);
  const [form, setForm] = useState({
    templateName: "",
    language: "",
    status: "Active",
  });
  const [newFile, setNewFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const data = fetchTemplateById(id);
    setOriginal(data);
    setForm({
      templateName: data.templateName,
      language: data.language,
      status: data.status,
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, file: "Only PDF or DOCX files are supported." }));
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, file: "File size must be under 20 MB." }));
      return;
    }
    setNewFile(file);
    setErrors((prev) => ({ ...prev, file: "" }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const removeNewFile = () => {
    setNewFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const errs = {};
    if (!form.templateName.trim()) errs.templateName = "Template Name is required.";
    if (!form.language) errs.language = "Language is required.";
    return errs;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const nextVersion = newFile ? bumpVersion(original.version) : original.version;
    const payload = {
      id,
      templateName: form.templateName,
      documentCategory: original.documentCategory,
      language: form.language,
      status: form.status,
      version: nextVersion,
      newFile: newFile ?? null,
    };
    console.log("Updating template:", payload);
    navigate("/predefine-template");
  };

  if (!original) return null;

  const nextVersion = newFile ? bumpVersion(original.version) : null;

  return (
    <>
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
        >
          <FiArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Template</h1>
          <p className="text-sm text-gray-500">
            Update template metadata or upload a new document version
          </p>
        </div>
      </div>

      {/* FORM CARD */}
      <div className="bg-white rounded-2xl p-6 shadow-sm max-w-2xl">

        <FormField label="Template Name" required error={errors.templateName}>
          <input
            type="text"
            name="templateName"
            value={form.templateName}
            onChange={handleChange}
            className={inputClass(errors.templateName)}
          />
        </FormField>

        <FormField
          label="Document Category"
          required
          hint="Document category cannot be changed after creation to maintain logic mapping."
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={original.documentCategory}
              readOnly
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
            />
            <FiInfo className="text-gray-400 flex-shrink-0" title="Read-only" />
          </div>
        </FormField>

        <FormField label="Current Version">
          <div className="flex items-center gap-2">
            <span className="px-3 py-2 bg-gray-100 rounded-xl text-sm font-mono text-gray-700 border border-gray-200">
              {original.version}
            </span>
            {nextVersion && (
              <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-lg">
                Will update to {nextVersion} on save
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Uploading a new document auto-increments the version for audit traceability.
          </p>
        </FormField>

        <FormField
          label="Upload New Version"
          hint="Optional. Replaces the master document file. Triggers a new version number."
          error={errors.file}
        >
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
            <FiFile className="text-gray-400" />
            <span>Current file: <span className="font-medium text-gray-700">{original.uploadedFileName}</span></span>
          </div>

          {newFile ? (
            <div className="flex items-center gap-3 px-4 py-3 border border-green-200 bg-green-50 rounded-xl">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiFile className="text-green-600 text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{newFile.name}</p>
                <p className="text-xs text-gray-500">{(newFile.size / 1024).toFixed(1)} KB · New</p>
              </div>
              <button
                onClick={removeNewFile}
                className="p-1.5 rounded-full hover:bg-green-200 transition text-green-700"
                title="Remove"
              >
                <FiX />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl px-6 py-6 text-center cursor-pointer transition ${
                isDragging
                  ? "border-blue-400 bg-blue-50"
                  : errors.file
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              <FiUpload className="mx-auto text-xl text-gray-400 mb-1.5" />
              <p className="text-sm text-gray-600">
                Drop new version here or{" "}
                <span className="text-blue-600 font-medium">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">PDF or DOCX · Max 20 MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>
          )}
        </FormField>

        <FormField label="Language" required error={errors.language}>
          <select
            name="language"
            value={form.language}
            onChange={handleChange}
            className={inputClass(errors.language)}
          >
            <option value="">— Select Language —</option>
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Template Status" required>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className={inputClass()}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </FormField>

        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition text-sm font-medium"
          >
            <FiSave /> Update Template
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-100 text-gray-600 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default EditTemplate;

/* ─── HELPERS ─── */
const inputClass = (error) =>
  `w-full px-3 py-2.5 rounded-xl text-sm outline-none transition border ${
    error
      ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100"
      : "border-gray-200 bg-gray-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
  }`;

// ✅ FIX: removed "block" — conflicts with "flex"
const FormField = ({ label, required, hint, error, children }) => (
  <div className="mb-5">
    <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);