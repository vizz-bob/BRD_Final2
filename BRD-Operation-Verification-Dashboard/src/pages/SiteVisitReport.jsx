import React, { useEffect, useState } from "react";
import { getSiteVisit } from "../services/sitevisitService";

const MEDIA_BASE = "http://127.0.0.1:8000";

const SiteVisitReport = ({ visitId, onBack = () => {} }) => {
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visitId) fetchVisitData();
  }, [visitId]);

  const fetchVisitData = async () => {
    setLoading(true);
    setError(null);
    try {
      const visitData = await getSiteVisit(visitId);
      setVisit(visitData);
    } catch (err) {
      console.error("Failed to load site visit data", err);
      setError("Failed to load site visit data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resolvePhotoUrl = (src) => {
    if (!src) return null;
    return src.startsWith("http") ? src : `${MEDIA_BASE}${src}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 text-gray-500 text-sm">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3" />
        Loading site visit report…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-red-500 text-sm mb-3">{error}</p>
        <button
          onClick={onBack}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm transition-colors"
        >
          ← Back
        </button>
      </div>
    );
  }

  if (!visit) return null;

  const photos = visit.photos || [];
  const recommendations = visit.recommendations || [];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold leading-snug">
            Site Visit Report • {visit.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {visit.location} • {visit.visit_date}
          </p>
        </div>
        <button
          onClick={onBack}
          className="self-start sm:self-auto px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm transition-colors shrink-0"
        >
          ← Back
        </button>
      </div>

      <div className="space-y-4 text-sm text-gray-700">
        {/* Status */}
        <p>
          <strong>Status:</strong>{" "}
          <span className={visit.status === "COMPLETED" ? "text-green-600 font-medium" : "text-yellow-600 font-medium"}>
            {visit.status}
          </span>
        </p>

        {/* Photos count */}
        <p>
          <strong>Photos taken:</strong> {visit.photos_taken ?? photos.length}
        </p>

        {/* Coordinates */}
        <p className="break-words">
          <strong>Coordinates:</strong> {visit.latitude}, {visit.longitude}
        </p>

        {/* Observations */}
        <div>
          <h4 className="font-semibold mb-2">Observations</h4>
          <p className="text-gray-600 whitespace-pre-line text-xs sm:text-sm leading-relaxed">
            {visit.observations || "No observations recorded."}
          </p>
        </div>

        {/* Photos */}
        <div>
          <h4 className="font-semibold mb-2">Photos</h4>
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {photos.map((photo) => {
                const src = resolvePhotoUrl(photo.image);
                return src ? (
                  <img
                    key={photo.id}
                    src={src}
                    alt={`Site photo ${photo.id}`}
                    className="rounded-md object-cover h-24 sm:h-28 w-full"
                  />
                ) : null;
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-xs sm:text-sm">
              No photos uploaded for this visit.
            </p>
          )}
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-semibold mb-2">Actions / Recommendations</h4>
          {recommendations.length > 0 ? (
            <ul className="list-disc ml-5 text-gray-600 space-y-1 text-xs sm:text-sm">
              {recommendations.map((rec) => (
                <li key={rec.id}>{rec.text}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-xs sm:text-sm">
              No recommendations recorded.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteVisitReport;