import React, { useState, useEffect } from "react";
import { FiSave, FiX } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import concessionManagementService from "../../../services/concessionManagementService";

import {
  InputField,
  SelectField,
  TextAreaField,
} from "../../../components/master/Controls/SharedUIHelpers";

const APPLICABLE_ON = [
  { label: "Sanction", value: "Sanction" },
  { label: "Disbursement", value: "Disbursement" },
  { label: "Repayment", value: "Repayment" },
];

const STATUS = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

export default function ConcessionTypeForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    concession_type_name: "",
    applicable_on: "",
    description: "",
    status: "Active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(false);

  /* ---------- LOAD (EDIT MODE) ---------- */
  useEffect(() => {
    if (!id) return;

    const fetchConcessionType = async () => {
      setFetching(true);
      try {
        const res = await concessionManagementService.getType(id);
        setForm({
          concession_type_name: res.concession_type_name || "",
          applicable_on: res.applicable_on || "",
          description: res.description || "",
          status: res.status || "Active",
        });
      } catch {
        setError("Failed to load concession type.");
      } finally {
        setFetching(false);
      }
    };

    fetchConcessionType();
  }, [id]);

  /* ---------- CHANGE HANDLER ---------- */
  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      id
        ? await concessionManagementService.updateType(id, form)
        : await concessionManagementService.createType(form);

      navigate("/concession-management");
    } catch {
      setError("Failed to save concession type. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => navigate(-1);

  return (
    /* ── Backdrop ── */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      {/* ── Modal container ── */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">

        {/* ── Header ── */}
        <div className="px-8 pt-7 pb-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {id ? "Edit Concession Type" : "Add Concession Type"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Define where and how concessions apply
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-8 py-6">
          {fetching ? (
            <p className="text-gray-500 text-sm">Loading data...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Section header */}
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  Concession Type Details
                </p>
                <hr className="border-gray-100" />
              </div>

              <InputField
                label={<>Concession Type Name <span className="text-red-500">*</span></>}
                value={form.concession_type_name}
                onChange={(e) => handleChange("concession_type_name", e.target.value)}
                placeholder="e.g. Interest Rate"
              />

              <SelectField
                label={<>Applicable On <span className="text-red-500">*</span></>}
                value={form.applicable_on}
                onChange={(e) => handleChange("applicable_on", e.target.value)}
                options={APPLICABLE_ON}
                placeholder="Select stage"
              />

              <SelectField
                label="Status"
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                options={STATUS}
              />

              {/* Description — full width */}
              <div className="md:col-span-2">
                <TextAreaField
                  label="Description"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                  maxLength={300}
                  helperText="Brief description of concession type"
                />
              </div>

              {error && (
                <div className="md:col-span-2 text-sm text-red-600">{error}</div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-8 py-5 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || fetching}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            <FiSave size={15} />
            {loading ? "Saving..." : "Save Type"}
          </button>
        </div>
      </div>
    </div>
  );
}