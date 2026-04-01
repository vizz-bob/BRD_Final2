import React, { useState } from 'react';

const BulkApproveModal = ({ isOpen, onClose, selectedApplications, onApprove }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleApproveClick = async () => {
    setLoading(true);
    setMessage('');
    try {
      await onApprove(selectedApplications.map(app => app.id));
      setMessage('Applications approved successfully!');
      setTimeout(onClose, 2000);
    } catch (error) {
      setMessage(`Error: ${error.message || 'Failed to approve applications.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-end sm:items-center justify-center px-0 sm:px-4 z-50">
      <div className="bg-white p-6 sm:p-8 rounded-t-2xl sm:rounded-lg shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Confirm Bulk Approval</h2>

        {selectedApplications.length > 0 ? (
          <div className="mb-4">
            <p className="text-gray-700 mb-2 text-sm">
              You are about to approve the following applications:
            </p>
            <ul className="list-disc list-inside text-gray-600 text-sm max-h-40 overflow-y-auto space-y-1">
              {selectedApplications.map((app, index) => (
                <li key={index}>
                  {app['Credit Score']} - {app['Loan Amount']} ({app['Status']})
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-700 mb-4 text-sm">No applications selected for approval.</p>
        )}

        {message && (
          <p className={`mb-4 text-sm ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 text-sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
            onClick={handleApproveClick}
            disabled={loading || selectedApplications.length === 0}
          >
            {loading ? 'Approving...' : 'Approve Selected'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkApproveModal;