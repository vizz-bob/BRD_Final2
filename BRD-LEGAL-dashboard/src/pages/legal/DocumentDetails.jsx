// pages/legal/DocumentDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchDocumentById } from "../../api/documentValidationApi";
import { fetchDocumentById as fetchDocumentByIdDashboard, fetchDocuments as fetchAllDocuments } from "../../api/dashboardApi";

const DocumentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDocumentDetails();
  }, [id]);

  const loadDocumentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      let data = null;
      let lastError = null;

      try {
        data = await fetchDocumentById(id);
      } catch (err) {
        lastError = err;
      }
      if (!data) {
        try { data = await fetchDocumentByIdDashboard(id); } catch (err) { lastError = err; }
      }
      if (!data) {
        try {
          const allDocsResponse = await fetchAllDocuments();
          const allDocs = allDocsResponse.results ? allDocsResponse.results : allDocsResponse;
          const found = allDocs.find(doc => doc.id === parseInt(id) || doc.document_id === parseInt(id) || doc.id === id || doc.document_id === id);
          if (found) data = found;
        } catch (err) {}
      }
      if (!data) throw lastError || new Error('Document not found in any API');

      let uploadDate = 'N/A';
      try {
        const dateValue = data.upload_date || data.created_at || data.date || null;
        if (dateValue) {
          const dateObj = new Date(dateValue);
          if (!isNaN(dateObj.getTime())) uploadDate = dateObj.toISOString().slice(0, 10);
        }
      } catch (e) {}

      setDoc({
        id: data.document_id || data.id,
        name: data.name || data.document_name || 'Unknown',
        type: data.document_type || 'Unknown',
        client: data.client_name || 'Unknown',
        uploadDate,
        status: data.status || 'Unknown',
        issues: data.issues ? (typeof data.issues === 'string' ? data.issues.split(',').map(i => i.trim()).filter(i => i) : data.issues) : [],
      });
    } catch (err) {
      console.error('Error loading document:', err);
      setError('Failed to load document details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
        <p className="text-gray-500 text-sm">Loading document details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm mb-4">{error}</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700" onClick={loadDocumentDetails}>Try again</button>
            <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700" onClick={() => navigate("/legal/documents")}>Back to Documents</button>
          </div>
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <h2 className="text-xl font-bold text-red-600">Document not found</h2>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700" onClick={() => navigate("/legal/documents")}>Back to Documents</button>
      </div>
    );
  }

  const statusColors = {
    Valid: "bg-green-100 text-green-800",
    Invalid: "bg-red-100 text-red-800",
    Pending: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-5 sm:mb-6">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 leading-tight">{doc.name}</h1>
            <p className="text-gray-500 text-sm mt-1">Document ID: {doc.id}</p>
          </div>
          <span className={`self-start px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shrink-0 ${statusColors[doc.status] || "bg-gray-100 text-gray-800"}`}>
            {doc.status}
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-gray-200">
          {[
            { label: "Document Type", value: doc.type },
            { label: "Client Name", value: doc.client },
            { label: "Upload Date", value: doc.uploadDate },
            { label: "Status", value: doc.status },
          ].map(({ label, value }) => (
            <div key={label}>
              <label className="block text-xs sm:text-sm font-semibold text-gray-600 mb-1">{label}</label>
              <p className="text-gray-900 text-sm sm:text-base">{value}</p>
            </div>
          ))}
        </div>

        {/* Issues */}
        {doc.issues && doc.issues.length > 0 && (
          <div className="mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Issues Found</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <ul className="list-disc list-inside space-y-1.5">
                {doc.issues.map((issue, idx) => <li key={idx} className="text-red-700 text-sm">{issue}</li>)}
              </ul>
            </div>
          </div>
        )}

        {/* Status banners */}
        {doc.status === "Valid" && (
          <div className="mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-gray-200">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <p className="text-green-800 font-semibold text-sm">✓ This document has been validated and approved.</p>
            </div>
          </div>
        )}
        {doc.status === "Invalid" && (
          <div className="mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-gray-200">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <p className="text-red-800 font-semibold text-sm">✗ This document has been rejected. Please review the issues above and resubmit.</p>
            </div>
          </div>
        )}
        {doc.status === "Pending" && (
          <div className="mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-gray-200">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
              <p className="text-yellow-800 font-semibold text-sm">⏳ This document is pending review. Please wait for validation.</p>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="mb-5 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Additional Information</h2>
          <p className="text-gray-600 text-sm">
            Use this page to review all details about the document. For any questions or further review, contact the legal department.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200">
          <button className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors" onClick={() => navigate("/legal/documents")}>
            Back to Documents
          </button>
          <button className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-gray-200 text-gray-900 text-sm rounded-lg hover:bg-gray-300 transition-colors" onClick={loadDocumentDetails}>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetails;