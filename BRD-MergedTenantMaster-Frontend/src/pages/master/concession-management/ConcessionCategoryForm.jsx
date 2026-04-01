import React, { useEffect, useState } from "react";
import { FiSave, FiX } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import concessionManagementService from "../../../services/concessionManagementService";

import {
  InputField,
  SelectField,
  TextAreaField,
} from "../../../components/master/Controls/SharedUIHelpers";

const PRODUCTS = [
  { label: "Payday Loan (Short-term Loan)", value: "Payday Loan (Short-term Loan)" },
  { label: "Personal Loan (Unsecured)", value: "Personal Loan (Unsecured)" },
  { label: "Business Loan", value: "Business Loan" },
  { label: "Group Loan (JLG/SHG Model)", value: "Group Loan (JLG/SHG Model)" },
  { label: "Unsecured Education Loan", value: "Unsecured Education Loan" },
  { label: "Consumer Durable Loan", value: "Consumer Durable Loan" },
  { label: "Loan Against Property (LAP)", value: "Loan Against Property (LAP)" },
  { label: "Loan Against Shares/Securities", value: "Loan Against Shares/Securities" },
  { label: "Gold Loan", value: "Gold Loan" },
  { label: "Vehicle Loan", value: "Vehicle Loan" },
  { label: "Secured Education Loan", value: "Secured Education Loan" },
  { label: "Supply Chain Finance", value: "Supply Chain Finance" },
  { label: "Bill/Invoice Discounting", value: "Bill/Invoice Discounting" },
  { label: "Virtual Card (Buy Now, Pay Later)", value: "Virtual Card (Buy Now, Pay Later)" },
  { label: "Credit Line - OD Facility", value: "Credit Line - OD Facility" },
];

const STATUS = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

export default function ConcessionCategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [categoryId, setCategoryId] = useState(null);

  const [form, setForm] = useState({
    category_name: "",
    linked_concession_type: "",
    eligibility_criteria: "",
    product_type: "",
    valid_from: "",
    valid_to: "",
    status: "Active",
  });

  /* ---------- LOAD CONCESSION TYPES ---------- */
  useEffect(() => {
    const loadTypes = async () => {
      try {
        const res = await concessionManagementService.getAllTypes();
        setTypes(
          (res || []).map((t) => ({
            label: t.concession_type_name,
            value: t.uuid,
          }))
        );
      } catch {
        setError("Failed to load concession types");
      }
    };
    loadTypes();
  }, []);

  /* ---------- LOAD CATEGORY (EDIT) ---------- */
  useEffect(() => {
    if (!id) return;

    const fetchCategory = async () => {
      setFetching(true);
      try {
        const res = await concessionManagementService.getCategory(id);
        setCategoryId(res.category_id || res.id || null);
        setForm({
          category_name: res.category_name || "",
          linked_concession_type: res.linked_concession_type || "",
          eligibility_criteria: res.eligibility_criteria || "",
          product_type: res.product_type || "",
          valid_from: res.valid_from || "",
          valid_to: res.valid_to || "",
          status: res.status || "Active",
        });
      } catch {
        setError("Failed to load category details");
      } finally {
        setFetching(false);
      }
    };

    fetchCategory();
  }, [id]);

  /* ---------- CHANGE HANDLER ---------- */
  const handleChange = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      id
        ? await concessionManagementService.updateCategory(id, form)
        : await concessionManagementService.createCategory(form);

      navigate("/concession-management");
    } catch (err) {
      console.error(err);
      setError("Failed to save concession category");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => navigate(-1);

  return (
    /* ── Backdrop ── */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      {/* ── Modal container ── */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 flex flex-col max-h-[90vh]">

        {/* ── Header ── */}
        <div className="px-8 pt-7 pb-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {id ? "Edit Concession Category" : "Add Concession Category"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Configure concession category rules
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
            <p className="text-gray-500 text-sm">Loading category details...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* ── Section 1: Basic Details ── */}
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  Basic Details
                </p>
                <hr className="border-gray-100" />
              </div>

              {/* Category ID — shown in edit mode only */}
              {id && categoryId && (
                <InputField
                  label="Category ID"
                  value={categoryId}
                  disabled
                />
              )}

              <InputField
                label={<>Category Name <span className="text-red-500">*</span></>}
                value={form.category_name}
                onChange={(e) => handleChange("category_name", e.target.value)}
                placeholder="e.g. Senior Citizen Offer"
              />

              <SelectField
                label={<>Linked Concession Type <span className="text-red-500">*</span></>}
                value={form.linked_concession_type}
                onChange={(e) => handleChange("linked_concession_type", e.target.value)}
                options={types}
                placeholder="Select concession type"
              />

              <SelectField
                label={<>Product Type <span className="text-red-500">*</span></>}
                value={form.product_type}
                onChange={(e) => handleChange("product_type", e.target.value)}
                options={PRODUCTS}
                placeholder="Select product"
              />

              {/* ── Section 2: Validity ── */}
              <div className="md:col-span-2 mt-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  Validity
                </p>
                <hr className="border-gray-100" />
              </div>

              <InputField
                label={<>Valid From <span className="text-red-500">*</span></>}
                type="date"
                value={form.valid_from}
                onChange={(e) => handleChange("valid_from", e.target.value)}
              />

              <InputField
                label={<>Valid To <span className="text-red-500">*</span></>}
                type="date"
                value={form.valid_to}
                onChange={(e) => handleChange("valid_to", e.target.value)}
              />

              {/* ── Section 3: Eligibility & Status ── */}
              <div className="md:col-span-2 mt-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  Eligibility &amp; Status
                </p>
                <hr className="border-gray-100" />
              </div>

              <div className="md:col-span-2">
                <TextAreaField
                  label="Eligibility Criteria"
                  name="eligibility_criteria"
                  value={form.eligibility_criteria}
                  onChange={(e) => handleChange("eligibility_criteria", e.target.value)}
                  rows={5}
                  maxLength={500}
                  helperText="Define eligibility rules (max 500 characters)"
                />
              </div>

              <SelectField
                label="Status"
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                options={STATUS}
              />

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
            {loading ? "Saving..." : "Save Category"}
          </button>
        </div>
      </div>
    </div>
  );
}