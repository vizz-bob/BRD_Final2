import React from 'react';
import { MapPin, Calendar } from 'lucide-react';

const SiteVisitMap = ({ visits, onViewPhotos = () => {}, onViewReport = () => {} }) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h3 className="text-base sm:text-lg font-semibold mb-4">Geo-Tagged Site Visits</h3>
      <div className="space-y-3 sm:space-y-4">
        {visits.map((visit) => (
          <div
            key={visit.id}
            className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
          >
            {/* Title + Status */}
            <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                  {visit.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">
                  {visit.location}
                </p>
              </div>
              <span className={`shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${
                visit.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                visit.status === 'PENDING'   ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {visit.status.charAt(0) + visit.status.slice(1).toLowerCase()}
              </span>
            </div>

            {/* Meta + Buttons */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-1">
                  <MapPin size={14} className="shrink-0" />
                  <span className="truncate max-w-[140px] sm:max-w-none">
                    {visit.latitude}, {visit.longitude}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} className="shrink-0" />
                  <span>{visit.visit_date}</span>
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onViewPhotos(visit)}
                  className="flex-1 sm:flex-none px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-xs sm:text-sm font-medium transition-colors"
                >
                  Photos ({visit.photos_taken})
                </button>
                <button
                  onClick={() => onViewReport(visit)}
                  className="flex-1 sm:flex-none px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-xs sm:text-sm font-medium transition-colors"
                >
                  View Report
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SiteVisitMap;