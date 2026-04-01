import React, { useState, useEffect } from "react";
import { metricsService } from "../services/home";

const IndividualMetric = ({ 
  metricId, 
  category = null, 
  showTrend = true, 
  showPrevious = false,
  className = "",
  size = "medium" // small, medium, large
}) => {
  const [metric, setMetric] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetric = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let data;
        if (metricId) {
          data = await metricsService.getById(metricId);
        } else if (category) {
          const categoryData = await metricsService.getByCategory(category);
          // Get first metric from category or null if empty
          data = categoryData[category]?.[0] || null;
        }
        
        setMetric(data);
      } catch (err) {
        console.error("Failed to fetch metric:", err);
        setError("Failed to load metric data");
      } finally {
        setLoading(false);
      }
    };

    fetchMetric();
  }, [metricId, category]);

  const getTrendIcon = (trend) => {
    if (!trend || trend === "stable") return null;
    return trend > 0 ? "📈" : "📉";
  };

  const getTrendColor = (trend) => {
    if (!trend || trend === "stable") return "text-slate-500";
    return trend > 0 ? "text-green-600" : "text-red-600";
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return {
          container: "p-3",
          value: "text-lg font-semibold",
          label: "text-xs",
          trend: "text-xs"
        };
      case "large":
        return {
          container: "p-6",
          value: "text-4xl font-bold",
          label: "text-sm",
          trend: "text-sm"
        };
      default: // medium
        return {
          container: "p-4",
          value: "text-2xl font-bold",
          label: "text-xs",
          trend: "text-xs"
        };
    }
  };

  const sizeClasses = getSizeClasses();

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 ${sizeClasses.container} ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !metric) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 ${sizeClasses.container} ${className}`}>
        <div className="text-center text-slate-500">
          <p className={sizeClasses.label}>{error || "Metric not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow ${sizeClasses.container} ${className}`}>
      {/* Metric Name */}
      <p className={`${sizeClasses.label} text-slate-500 uppercase tracking-wider mb-1`}>
        {metric.name}
      </p>

      {/* Main Value */}
      <div className="flex items-baseline gap-1 mb-2">
        <span className={`${sizeClasses.value} text-slate-900`}>
          {metric.value}
        </span>
        <span className={`${sizeClasses.label} text-slate-400`}>
          {metric.unit}
        </span>
      </div>

      {/* Previous Value (if shown) */}
      {showPrevious && metric.previous_value && (
        <p className={`${sizeClasses.trend} text-slate-400 mb-1`}>
          Previous: {metric.previous_value} {metric.unit}
        </p>
      )}

      {/* Trend Information */}
      {showTrend && (
        <div className="flex items-center gap-1">
          {getTrendIcon(metric.change_percentage)}
          <span className={`${sizeClasses.trend} ${getTrendColor(metric.change_percentage)}`}>
            {metric.change_percentage > 0 ? "+" : ""}
            {metric.change_percentage}%
          </span>
          <span className={`${sizeClasses.trend} text-slate-400`}>
            vs last period
          </span>
        </div>
      )}

      {/* Category Badge */}
      <div className="mt-2">
        <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
          {metric.category}
        </span>
      </div>
    </div>
  );
};

export default IndividualMetric;
