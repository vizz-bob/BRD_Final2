import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UploadDocumentModal from "../../components/UploadDocumentModal";
import {
  StatCard,
  DocumentVerificationMetrics,
} from "../../components/DashboardComponents";
import {
  DocumentDuplicateIcon,
  ClockIcon,
  EyeIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  fetchDocuments,
  validateDocument,
  rejectDocument,
  createDocument,
  uploadDocument,
} from "../../api/documentValidationApi";

const DocumentValidation = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDocuments();
      const docsArray = Array.isArray(data) ? data : (data.results || []);
      const transformedDocs = docsArray.map((doc) => ({
        id: doc.document_id,
        name: doc.name,
        type: doc.document_type,
        client: doc.client_name,
        uploadDate: new Date(doc.upload_date).toISOString().slice(0, 10),
        status: doc.status,
        issues: doc.issues ? doc.issues.split(',').map(i => i.trim()).filter(i => i) : [],
      }));
      setDocuments(transformedDocs);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents. Please try again.');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = documents.filter((doc) => {
    if (filter !== "all" && doc.status.toLowerCase() !== filter.toLowerCase()) return false;
    if (
      searchQuery &&
      !doc.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !doc.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) &&
      !doc.client.toLowerCase().includes(searchQuery.toLowerCase())
    ) return false;
    return true;
  });

  const refreshDocs = async () => {
    const data = await fetchDocuments();
    const docsArray = Array.isArray(data) ? data : (data.results || []);
    return docsArray.map((doc) => ({
      id: doc.document_id,
      name: doc.name,
      type: doc.document_type,
      client: doc.client_name,
      uploadDate: new Date(doc.upload_date).toISOString().slice(0, 10),
      status: doc.status,
      issues: doc.issues ? doc.issues.split(',').map(i => i.trim()).filter(i => i) : [],
    }));
  };

  const handleValidate = async (id) => {
    try {
      setDocuments(documents.map((doc) => doc.id === id ? { ...doc, status: "Valid", issues: [] } : doc));
      await validateDocument(id);
      setDocuments(await refreshDocs());
      alert(`Document ${id} validated successfully.`);
    } catch (err) {
      console.error('Error validating document:', err);
      alert('Failed to validate document. Please try again.');
      loadDocuments();
    }
  };

  const handleReject = async (id) => {
    try {
      const issueReason = prompt('Enter reason for rejection:', 'Rejected by legal team');
      if (!issueReason) return;
      setDocuments(documents.map((doc) =>
        doc.id === id ? { ...doc, status: "Invalid", issues: issueReason ? [issueReason] : ["Rejected by legal team"] } : doc
      ));
      await rejectDocument(id, issueReason);
      setDocuments(await refreshDocs());
      alert(`Document ${id} rejected.`);
    } catch (err) {
      console.error('Error rejecting document:', err);
      alert('Failed to reject document. Please try again.');
      loadDocuments();
    }
  };

  const handleUploadDocument = () => setIsUploadModalOpen(true);
  const handleCloseUploadModal = () => setIsUploadModalOpen(false);

  const handleDocumentUpload = async (file, type, client) => {
    try {
      const newDocRecord = await createDocument({ name: file.name, document_type: type, client_name: client, status: "Pending" });
      const formData = new FormData();
      formData.append('document_file', file);
      formData.append('document_type', type);
      formData.append('client_name', client);
      await uploadDocument(formData);
      const newDoc = {
        id: newDocRecord.document_id,
        name: newDocRecord.name,
        type: newDocRecord.document_type,
        client: newDocRecord.client_name,
        uploadDate: new Date(newDocRecord.upload_date).toISOString().slice(0, 10),
        status: newDocRecord.status,
        issues: [],
      };
      setDocuments((prevDocs) => [newDoc, ...prevDocs]);
      alert(`Document ${file.name} uploaded successfully!`);
      handleCloseUploadModal();
    } catch (err) {
      console.error('Error uploading document:', err);
      alert('Failed to upload document. Please try again.');
    }
  };

  const statusBadge = (status) => (
    <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${
      status === "Valid" ? "bg-green-100 text-green-800" :
      status === "Invalid" ? "bg-red-100 text-red-800" :
      "bg-yellow-100 text-yellow-800"
    }`}>{status}</span>
  );

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
          <button onClick={loadDocuments} className="mt-2 text-sm text-red-600 hover:text-red-900 underline">
            Try again
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Document Validation</h1>
          <p className="mt-0.5 text-sm text-gray-500">Review and validate submitted documents</p>
        </div>
        <button
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          onClick={handleUploadDocument}
          disabled={loading}
        >
          Upload Document
        </button>
      </div>

      {/* Summary Cards */}
      <DocumentVerificationMetrics
        items={[
          { title: "Total Documents", mainValue: documents.length, subText: "Total in system", trendValue: documents.length, trendType: "up", icon: DocumentDuplicateIcon },
          { title: "Pending Review", mainValue: documents.filter((d) => d.status === "Pending").length, subText: "Awaiting validation", trendValue: documents.filter((d) => d.status === "Pending").length, trendType: "up", icon: EyeIcon },
          { title: "Validated", mainValue: documents.filter((d) => d.status === "Valid").length, subText: documents.length > 0 ? `${Math.round((documents.filter((d) => d.status === "Valid").length / documents.length) * 100)}% success rate` : "No documents", trendValue: documents.filter((d) => d.status === "Valid").length, trendType: "up", icon: CheckBadgeIcon },
          { title: "Issues Found", mainValue: documents.filter((d) => d.status === "Invalid").length, subText: documents.length > 0 ? `${Math.round((documents.filter((d) => d.status === "Invalid").length / documents.length) * 100)}% of total` : "No issues", trendValue: documents.filter((d) => d.status === "Invalid").length, trendType: documents.filter((d) => d.status === "Invalid").length > 0 ? "down" : "up", icon: ExclamationTriangleIcon },
        ]}
      />

      {/* Filters + Table */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        {/* Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">Status:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            >
              <option value="all">All Documents</option>
              <option value="pending">Pending</option>
              <option value="valid">Valid</option>
              <option value="invalid">Invalid</option>
            </select>
          </div>
          <input
            type="search"
            placeholder="Search by name, ID or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
          />
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span className="ml-3 text-sm text-gray-500">Loading documents...</span>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Document ID", "Name", "Type", "Client", "Upload Date", "Status", "Issues", "Actions"].map((h) => (
                      <th key={h} className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">{doc.id}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">{doc.name}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">{doc.type}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">{doc.client}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">{doc.uploadDate}</td>
                      <td className="px-4 sm:px-6 py-4">{statusBadge(doc.status)}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">
                        {doc.issues.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {doc.issues.map((issue, idx) => <li key={idx} className="text-red-600">{issue}</li>)}
                          </ul>
                        ) : (
                          <span className="text-green-600">No issues</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap">
                        {doc.status === "Pending" ? (
                          <>
                            <button onClick={() => handleValidate(doc.id)} className="text-green-600 hover:text-green-900 mr-3">Validate</button>
                            <button onClick={() => handleReject(doc.id)} className="text-red-600 hover:text-red-900">Reject</button>
                          </>
                        ) : (
                          <button onClick={() => navigate(`/legal/documents/${doc.id}`)} className="text-blue-600 hover:text-blue-900">View Details</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="px-6 py-6 text-center text-sm text-gray-500">No documents match your filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3">
              {filtered.length > 0 ? filtered.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="font-semibold text-gray-900 text-sm leading-snug">{doc.name}</span>
                    {statusBadge(doc.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-3">
                    <p className="text-xs text-gray-500"><span className="font-medium text-gray-600">ID: </span>{doc.id}</p>
                    <p className="text-xs text-gray-500"><span className="font-medium text-gray-600">Date: </span>{doc.uploadDate}</p>
                    <p className="text-xs text-gray-500"><span className="font-medium text-gray-600">Type: </span>{doc.type}</p>
                    <p className="text-xs text-gray-500"><span className="font-medium text-gray-600">Client: </span>{doc.client}</p>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    <span className="font-medium text-gray-600">Issues: </span>
                    {doc.issues.length > 0 ? doc.issues.join(", ") : <span className="text-green-600">No issues</span>}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                    {doc.status === "Pending" ? (
                      <>
                        <button onClick={() => handleValidate(doc.id)} className="px-3 py-1 text-xs font-medium text-green-600 border border-green-300 rounded-full hover:bg-green-50 transition">Validate</button>
                        <button onClick={() => handleReject(doc.id)} className="px-3 py-1 text-xs font-medium text-red-600 border border-red-300 rounded-full hover:bg-red-50 transition">Reject</button>
                      </>
                    ) : (
                      <button onClick={() => navigate(`/legal/documents/${doc.id}`)} className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-300 rounded-full hover:bg-blue-50 transition">View Details</button>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-center text-sm text-gray-500 py-6">No documents match your filters.</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-base font-semibold text-blue-900 mb-2">Document Guidelines</h3>
        <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
          <li>All documents must be in PDF format</li>
          <li>File size should not exceed 10MB</li>
          <li>Ensure all pages are clearly scanned</li>
          <li>Documents must contain required signatures and stamps</li>
          <li>Personal information should be clearly visible</li>
        </ul>
      </div>

      <UploadDocumentModal isOpen={isUploadModalOpen} onClose={handleCloseUploadModal} onUpload={handleDocumentUpload} />
    </div>
  );
};

export default DocumentValidation;