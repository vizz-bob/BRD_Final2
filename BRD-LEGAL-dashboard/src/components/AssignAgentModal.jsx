import React, { useState, useEffect } from 'react';

const AssignAgentModal = ({ isOpen, onClose, verificationId }) => {
  const [currentVerificationId, setCurrentVerificationId] = useState('');
  const [agent, setAgent] = useState('');

  useEffect(() => {
    if (isOpen && verificationId) {
      setCurrentVerificationId(verificationId);
    } else if (!isOpen) {
      setCurrentVerificationId('');
      setAgent('');
    }
  }, [isOpen, verificationId]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ currentVerificationId, agent });
    // Add logic to assign agent
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-end sm:items-center justify-center z-50 px-0 sm:px-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 sm:p-8 rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6">Assign Agent</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="verificationId" className="block text-sm font-medium text-gray-700">
              Verification ID
            </label>
            <input
              type="text"
              id="verificationId"
              value={currentVerificationId}
              onChange={(e) => setCurrentVerificationId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="agent" className="block text-sm font-medium text-gray-700">
              Select Agent
            </label>
            <select
              id="agent"
              value={agent}
              onChange={(e) => setAgent(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Select Agent</option>
              <option>Priya Singh</option>
              <option>Amit Kumar</option>
              <option>Rajesh Sharma</option>
            </select>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignAgentModal;