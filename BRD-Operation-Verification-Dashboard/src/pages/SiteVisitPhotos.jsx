import React, { useEffect, useState } from "react";
import { getSitePhotos } from "../services/siteVisitService";

const MEDIA_BASE = "http://127.0.0.1:8000";

const SiteVisitPhotos = ({ onBack, reportId = null }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSitePhotos(reportId);
      setPhotos(data);
    } catch (err) {
      console.error("Error loading photos:", err);
      setError("Failed to load photos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resolveImageUrl = (photo) => {
    const src = photo.image;
    if (!src) return null;
    return src.startsWith("http") ? src : `${MEDIA_BASE}${src}`;
  };

  return (
    <div className="p-2 sm:p-4">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="px-3 py-2 mb-4 bg-gray-100 hover:bg-gray-200 rounded-md text-sm transition-colors"
      >
        ← Back
      </button>

      {/* Loading / Error states */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="ml-3 text-gray-500 text-sm">Loading photos…</span>
        </div>
      )}

      {!loading && error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {/* Photos Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          {photos.length > 0 ? (
            photos.map((photo) => {
              const src = resolveImageUrl(photo);
              return src ? (
                <div
                  key={photo.id}
                  className="bg-gray-100 rounded-md overflow-hidden aspect-square"
                >
                  <img
                    src={src}
                    alt={`Site photo ${photo.id}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ) : null;
            })
          ) : (
            <p className="text-gray-500 text-sm col-span-full text-center py-8">
              No photos available.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SiteVisitPhotos;