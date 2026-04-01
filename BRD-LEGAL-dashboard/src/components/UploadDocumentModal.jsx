import React, { useState } from 'react';

const UploadDocumentModal = ({ isOpen, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [clientName, setClientName] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = () => {
    if (selectedFile && documentType && clientName) {
      onUpload(selectedFile, documentType, clientName);
      setSelectedFile(null);
      setDocumentType('');
      setClientName('');
      onClose();
    } else {
      alert('Please select a file, document type, and client name.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-0 sm:px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl p-6 sm:p-8 animate-fadeIn max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-5 sm:mb-6">
          Upload New Document
        </h2>

        <div className="space-y-5">
          {/* Document Type */}
          <div>
            <label
              htmlFor="documentType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Document Type
            </label>
            <input
              type="text"
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              placeholder="e.g., Property Document, Income Proof"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
            />
          </div>

          {/* Client Name */}
          <div>
            <label
              htmlFor="clientName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Client Name
            </label>
            <input
              type="text"
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g., Amit Kumar"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
            />
          </div>

          {/* File Upload */}
          <div>
            <label
              htmlFor="file-upload"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Document
            </label>
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-600
                hover:file:bg-blue-100 transition"
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-500 truncate">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm text-sm"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDocumentModal;