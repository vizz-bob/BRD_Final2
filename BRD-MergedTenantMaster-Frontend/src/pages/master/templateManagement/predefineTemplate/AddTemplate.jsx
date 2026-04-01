import React, { useState, useRef } from "react";
import { FiArrowLeft, FiSave, FiUpload, FiFile, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// ─── Constants ────────────────────────────────────────────────────────────────
const DOCUMENT_CATEGORIES = [
  "Sanction Letter",
  "Loan Agreement",
  "KFS (Key Fact Statement)",
  "Welcome Letter",
  "No Due Certificate",
  "Repayment Schedule",
];

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

// ─── Component ────────────────────────────────────────────────────────────────
const AddTemplate = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    templateName: "",
    documentCategory: "",
    language: "",
    status: "Active",
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  // ─── Handlers ──────────────────────────────────────────────────────────────
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
    setUploadedFile(file);
    setErrors((prev) => ({ ...prev, file: "" }));
  };

  const handleFileInputChange = (e) => handleFileSelect(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const newErrors = {};
    if (!form.templateName.trim()) newErrors.templateName = "Template Name is required.";
    if (!form.documentCategory) newErrors.documentCategory = "Document Category is required.";
    if (!form.language) newErrors.language = "Language is required.";
    if (!uploadedFile) newErrors.file = "Please upload a document (PDF or DOCX).";
    if (!form.status) newErrors.status = "Status is required.";
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      templateName: form.templateName,
      documentCategory: form.documentCategory,
      language: form.language,
      status: form.status,
      file: uploadedFile,
      version: "v1.0",
      uploaded_by: "Admin",
    };
    console.log("Submitting template:", payload);
    navigate("/predefine-template");
  };

  // ─── Render ────────────────────────────────────────────────────────────────
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
          <h1 className="text-2xl font-bold text-gray-900">Upload Template</h1>
          <p className="text-sm text-gray-500">
            Add a new predefined document template to the system
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
            placeholder="e.g. Retail Loan Sanction Letter"
            className={inputClass(errors.templateName)}
          />
        </FormField>

        <FormField label="Document Category" required error={errors.documentCategory}>
          <select
            name="documentCategory"
            value={form.documentCategory}
            onChange={handleChange}
            className={inputClass(errors.documentCategory)}
          >
            <option value="">— Select Category —</option>
            {DOCUMENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
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

        <FormField
          label="Upload Document"
          required
          hint="Supported formats: PDF, DOCX · Max size: 20 MB"
          error={errors.file}
        >
          {uploadedFile ? (
            <div className="flex items-center gap-3 px-4 py-3 border border-green-200 bg-green-50 rounded-xl">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiFile className="text-green-600 text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={removeFile}
                className="p-1.5 rounded-full hover:bg-green-200 transition text-green-700"
                title="Remove file"
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
              className={`border-2 border-dashed rounded-xl px-6 py-8 text-center cursor-pointer transition ${
                isDragging
                  ? "border-blue-400 bg-blue-50"
                  : errors.file
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              <FiUpload className="mx-auto text-2xl text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Drag &amp; drop your file here, or{" "}
                <span className="text-blue-600 font-medium">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF or DOCX · Max 20 MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          )}
        </FormField>

        <FormField label="Template Status" required error={errors.status}>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className={inputClass(errors.status)}
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
            <FiSave /> Save Template
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

export default AddTemplate;

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