import React from "react";
import MetricsDashboard from "./MetricsDashboard";
import IndividualMetric from "./IndividualMetric";
import { metricsService } from "../services/home";

// Example 1: Show all metrics in a dashboard
export const AllMetricsDashboard = () => {
  return (
    <div className="p-6">
      <MetricsDashboard />
    </div>
  );
};

// Example 2: Show specific categories
export const CategoryMetricsDashboard = () => {
  const salesCategories = ["overview", "conversion", "financial"];
  
  return (
    <div className="p-6">
      <MetricsDashboard 
        categories={salesCategories}
        gridCols={4}
        showAddButton={true}
        onAddMetric={() => {
          // Handle add metric logic
          console.log("Add new metric");
        }}
      />
    </div>
  );
};

// Example 3: Individual metric by ID
export const SingleMetricExample = () => {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold mb-4">Key Performance Indicators</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <IndividualMetric 
          metricId={1} // Replace with actual metric ID
          size="large"
          showTrend={true}
          showPrevious={true}
        />
        
        <IndividualMetric 
          metricId={2} // Replace with actual metric ID
          size="medium"
          showTrend={true}
        />
        
        <IndividualMetric 
          category="overview" // Show first metric from overview category
          size="small"
        />
      </div>
    </div>
  );
};

// Example 4: Real-time metrics with auto-refresh
export const RealTimeMetrics = () => {
  const [refreshInterval, setRefreshInterval] = React.useState(30000); // 30 seconds
  
  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Real-Time Dashboard</h2>
        <select 
          value={refreshInterval}
          onChange={(e) => setRefreshInterval(Number(e.target.value))}
          className="px-3 py-1 border border-slate-300 rounded text-sm"
        >
          <option value={10000}>10 seconds</option>
          <option value={30000}>30 seconds</option>
          <option value={60000}>1 minute</option>
          <option value={300000}>5 minutes</option>
        </select>
      </div>
      
      <MetricsDashboard 
        categories={["overview", "team"]}
        gridCols={2}
      />
    </div>
  );
};

// Example 5: Metrics by category sections
export const CategorizedMetrics = () => {
  return (
    <div className="p-6 space-y-8">
      {/* Overview Metrics */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Overview</h3>
        <MetricsDashboard 
          categories={["overview"]}
          gridCols={4}
        />
      </section>

      {/* Financial Metrics */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Financial Performance</h3>
        <MetricsDashboard 
          categories={["financial"]}
          gridCols={3}
        />
      </section>

      {/* Team Metrics */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Team Performance</h3>
        <MetricsDashboard 
          categories={["team"]}
          gridCols={2}
        />
      </section>
    </div>
  );
};

// Example 6: Compact metrics row
export const MetricsRow = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <IndividualMetric 
          category="overview"
          size="small"
          showTrend={false}
        />
        <IndividualMetric 
          category="conversion"
          size="small"
          showTrend={false}
        />
        <IndividualMetric 
          category="financial"
          size="small"
          showTrend={false}
        />
        <IndividualMetric 
          category="team"
          size="small"
          showTrend={false}
        />
      </div>
    </div>
  );
};

// Example 7: Adding new metrics programmatically
export const MetricsWithAdd = () => {
  const handleAddMetric = async () => {
    try {
      const newMetric = await metricsService.create({
        name: "New Custom Metric",
        value: 100.00,
        unit: "count",
        category: "overview",
        previous_value: 95.00,
        change_percentage: 5.26
      });
      
      console.log("Created new metric:", newMetric);
      // You might want to refresh the dashboard here
      window.location.reload();
    } catch (error) {
      console.error("Failed to create metric:", error);
    }
  };

  return (
    <div className="p-6">
      <MetricsDashboard 
        showAddButton={true}
        onAddMetric={handleAddMetric}
      />
    </div>
  );
};

// Example 8: Metrics with custom styling
export const StyledMetrics = () => {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <IndividualMetric 
          metricId={1}
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        />
        <IndividualMetric 
          metricId={2}
          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
        />
        <IndividualMetric 
          metricId={3}
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
        />
      </div>
    </div>
  );
};

// Export all examples for easy import
export default {
  AllMetricsDashboard,
  CategoryMetricsDashboard,
  SingleMetricExample,
  RealTimeMetrics,
  CategorizedMetrics,
  MetricsRow,
  MetricsWithAdd,
  StyledMetrics
};
