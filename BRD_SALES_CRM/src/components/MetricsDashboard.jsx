import React, { useState, useEffect } from "react";
import { RefreshCw, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { metricsService } from "../services/home";
import IndividualMetric from "./IndividualMetric";

const MetricsDashboard = ({ 
  categories = null, // null for all categories, or array of categories
  showAddButton = false,
  onAddMetric = null,
  gridCols = 3 // 2, 3, or 4
}) => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, [categories]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (categories && categories.length > 0) {
        // Fetch specific categories
        const categoryPromises = categories.map(cat => 
          metricsService.getAll({ category: cat, is_active: true })
        );
        const results = await Promise.all(categoryPromises);
        data = results.flat();
      } else {
        // Fetch all active metrics
        data = await metricsService.getAll({ is_active: true });
      }
      
      setMetrics(data);
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
      setError("Failed to load metrics");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMetrics();
    setRefreshing(false);
  };

  const handleBulkUpdate = async (updatedMetrics) => {
    try {
      await metricsService.bulkUpdate(updatedMetrics);
      await fetchMetrics(); // Refresh data
    } catch (err) {
      console.error("Failed to update metrics:", err);
    }
  };

  const getGridCols = () => {
    switch (gridCols) {
      case 2: return "grid-cols-1 md:grid-cols-2";
      case 4: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
      default: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      overview: "bg-blue-100 text-blue-800",
      team: "bg-green-100 text-green-800",
      conversion: "bg-purple-100 text-purple-800",
      financial: "bg-yellow-100 text-yellow-800",
      pipeline: "bg-pink-100 text-pink-800",
      productivity: "bg-indigo-100 text-indigo-800"
    };
    return colors[category] || "bg-slate-100 text-slate-800";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900">Dashboard Metrics</h2>
          <div className="animate-pulse">
            <div className="h-8 w-8 bg-slate-200 rounded"></div>
          </div>
        </div>
        <div className={`grid ${getGridCols()} gap-4`}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <button 
          onClick={fetchMetrics}
          className="mt-2 text-sm underline text-red-600"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Dashboard Metrics</h2>
          <p className="text-sm text-slate-500">
            {categories ? `${categories.join(", ")} metrics` : "All active metrics"}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {showAddButton && onAddMetric && (
            <button
              onClick={onAddMetric}
              className="p-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
              title="Add new metric"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={handleRefresh}
            className={`p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors ${
              refreshing ? "animate-spin" : ""
            }`}
            disabled={refreshing}
            title="Refresh metrics"
          >
            <RefreshCw className="h-4 w-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      {metrics.length > 0 ? (
        <div className={`grid ${getGridCols()} gap-4`}>
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] p-4"
            >
              {/* Header with category */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {metric.name}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getCategoryColor(metric.category)}`}>
                    {metric.category}
                  </span>
                </div>
                
                {/* Trend indicator */}
                {metric.change_percentage !== 0 && (
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    metric.change_percentage > 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {metric.change_percentage > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(metric.change_percentage)}%
                  </div>
                )}
              </div>

              {/* Main value */}
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold text-slate-900">
                  {metric.value}
                </span>
                <span className="text-sm text-slate-400">
                  {metric.unit}
                </span>
              </div>

              {/* Previous value comparison */}
              {metric.previous_value && (
                <div className="text-xs text-slate-500">
                  Previous: {metric.previous_value} {metric.unit}
                </div>
              )}

              {/* Last updated */}
              <div className="text-xs text-slate-400 mt-2">
                Updated: {new Date(metric.last_updated).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
          <p className="text-slate-400 font-medium">No metrics found</p>
          <p className="text-xs text-slate-400 mt-1">
            {categories 
              ? `No active metrics in ${categories.join(", ")} categories` 
              : "No active metrics found"}
          </p>
          {showAddButton && onAddMetric && (
            <button
              onClick={onAddMetric}
              className="mt-4 px-4 py-2 bg-brand-blue text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
              Add First Metric
            </button>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {metrics.length > 0 && (
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-900">{metrics.length}</p>
              <p className="text-xs text-slate-500">Total Metrics</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {metrics.filter(m => m.change_percentage > 0).length}
              </p>
              <p className="text-xs text-slate-500">Improving</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {metrics.filter(m => m.change_percentage < 0).length}
              </p>
              <p className="text-xs text-slate-500">Declining</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-600">
                {metrics.filter(m => m.change_percentage === 0).length}
              </p>
              <p className="text-xs text-slate-500">Stable</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsDashboard;
