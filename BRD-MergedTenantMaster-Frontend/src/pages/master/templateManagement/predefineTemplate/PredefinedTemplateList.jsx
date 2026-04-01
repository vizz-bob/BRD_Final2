import React, { useState, useRef } from "react";
import {
  FiUpload, FiEdit3, FiTrash2, FiSearch, FiEye,
  FiFileText, FiX, FiSave, FiFile,
} from "react-icons/fi";
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
  "English", "Hindi", "Bengali", "Tamil", "Telugu",
  "Marathi", "Kannada", "Gujarati", "Malayalam", "Punjabi",
];

// ─── Main Component ───────────────────────────────────────────────────────────
const PredefinedTemplateList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "Retail Loan Template",
      documentCategory: "Loan Agreement",
      language: "English",
      version: "v1.0",
      uploaded_by: "Admin",
      status: "Active",
    },
    {
      id: 2,
      name: "Corporate Sanction Letter",
      documentCategory: "Sanction Letter",
      language: "English",
      version: "v2.0",
      uploaded_by: "Admin",
      status: "Inactive",
    },
    {
      id: 3,
      name: "KFS Standard Format",
      documentCategory: "KFS (Key Fact Statement)",
      language: "Hindi",
      version: "v1.0",
      uploaded_by: "Admin",
      status: "Active",
    },
  ]);

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.documentCategory.toLowerCase().includes(search.toLowerCase()) ||
      t.language.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const handleSaveTemplate = (newTemplate) => {
    setTemplates((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newTemplate.templateName,
        documentCategory: newTemplate.documentCategory,
        language: newTemplate.language,
        version: "v1.0",
        uploaded_by: "Admin",
        status: newTemplate.status,
      },
    ]);
    setShowModal(false);
  };

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 pt-2">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Predefined Templates</h1>
          <p className="text-sm text-gray-500">
            Upload new templates or manage existing document formats
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:bg-green-700 transition"
          >
            <FiUpload /> Upload Template
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-sm">
        <FiSearch className="text-gray-400 flex-shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by template name, category, or language..."
          className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* TABLE */}
      <div className="space-y-3">
        <div className="hidden md:grid grid-cols-7 bg-gray-100 rounded-xl px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
          <div className="col-span-2">Template Name</div>
          <div>Category</div>
          <div>Language</div>
          <div>Version</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        {filteredTemplates.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-2xl px-5 py-4 shadow-sm grid grid-cols-2 md:grid-cols-7 gap-y-2 items-center text-sm hover:shadow-md transition"
          >
            <div className="col-span-2 flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <FiFileText className="text-blue-500 text-base" />
              </div>
              <span className="font-medium text-gray-900">{t.name}</span>
            </div>
            <div className="text-gray-600 text-xs md:text-sm">{t.documentCategory}</div>
            <div className="text-gray-600">{t.language}</div>
            <div className="text-gray-500 font-mono text-xs bg-gray-100 px-2 py-0.5 rounded-md w-fit">
              {t.version}
            </div>
            <StatusBadge status={t.status} />
            <div className="flex justify-end gap-2 col-span-2 md:col-span-1">
              <IconButton color="gray" title="View" onClick={() => navigate(`/predefine-template/view/${t.id}`)}>
                <FiEye />
              </IconButton>
              <IconButton color="blue" title="Edit" onClick={() => navigate(`/predefine-template/edit/${t.id}`)}>
                <FiEdit3 />
              </IconButton>
              <IconButton color="red" title="Delete" onClick={() => handleDelete(t.id)}>
                <FiTrash2 />
              </IconButton>
            </div>
          </div>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <FiFileText className="text-gray-300 text-4xl mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No templates found.</p>
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}
      {showModal && (
        <UploadTemplateModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveTemplate}
        />
      )}
    </>
  );
};

export default PredefinedTemplateList;

// ─── Upload Template Modal ────────────────────────────────────────────────────
const UploadTemplateModal = ({ onClose, onSave }) => {
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
    const errs = {};
    if (!form.templateName.trim()) errs.templateName = "Template Name is required.";
    if (!form.documentCategory) errs.documentCategory = "Document Category is required.";
    if (!form.language) errs.language = "Language is required.";
    if (!uploadedFile) errs.file = "Please upload a document (PDF or DOCX).";
    return errs;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave({ ...form, file: uploadedFile });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Upload Template</h2>
            <p className="text-xs text-gray-500">Add a new predefined document template to the system</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto px-6 py-5 flex-1">

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
                  <p className="text-sm font-medium text-gray-800 truncate">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={removeFile}
                  className="p-1.5 rounded-full hover:bg-green-200 transition text-green-700"
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
                className={`border-2 border-dashed rounded-xl px-6 py-7 text-center cursor-pointer transition ${
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
                  onChange={(e) => handleFileSelect(e.target.files[0])}
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
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="bg-gray-100 text-gray-600 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition text-sm font-medium"
          >
            <FiSave /> Save Template
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inputClass = (error) =>
  `w-full px-3 py-2.5 rounded-xl text-sm outline-none transition border ${
    error
      ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100"
      : "border-gray-200 bg-gray-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
  }`;

const FormField = ({ label, required, hint, error, children }) => (
  <div className="mb-4">
    <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const StatusBadge = ({ status }) => (
  <div className="flex items-center">
    <span
      className={`px-3 py-1 text-xs rounded-full font-medium ${
        status === "Active"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-600"
      }`}
    >
      {status}
    </span>
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