import React from "react";
import { Flag } from "lucide-react";

const DocumentRejections = ({ rejections = [] }) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h3 className="text-base sm:text-lg font-semibold">
          Document Rejection Analysis
        </h3>
        <button className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium flex items-center gap-2 transition-colors">
          <Flag size={16} />
          Flag Issue
        </button>
      </div>

      {rejections.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">
          No rejection records found.
        </p>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {rejections.map((rejection) => (
            <div
              key={rejection.id}
              className="border-l-4 border-red-500 bg-red-50 p-3 sm:p-4 rounded-r-lg"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {rejection.reason}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {rejection.description}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                    <span className="text-gray-500">
                      Document:{" "}
                      <span className="font-medium text-gray-900">
                        {rejection.doc_type}
                      </span>
                    </span>
                    <span className="text-gray-500">
                      Frequency:{" "}
                      <span className="font-medium text-red-600">
                        {rejection.frequency} times
                      </span>
                    </span>
                  </div>
                  {rejection.pattern && (
                    <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
                      <p className="text-xs sm:text-sm text-yellow-800">
                        <strong>Pattern Detected:</strong> {rejection.pattern}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentRejections;