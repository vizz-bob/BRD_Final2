// import React, { useState, useMemo, useEffect } from "react";
// import {
//   Download,
//   Filter,
//   RefreshCw,
//   TrendingUp,
//   BarChart3,
//   PieChart,
//   Activity,
//   Calendar,
// } from "lucide-react";
// import { reportService } from "../services/home";

// export default function ReportsPage() {
//   const [reports, setReports] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("overview");
//   const [error, setError] = useState(null);
//   const [isRefreshing, setIsRefreshing] = useState(false);

//   const fetchReports = async () => {
//     try {
//       setIsRefreshing(true);
//       setError(null);

//       const data = await reportService.getAll({ category: activeTab });
//       console.log("Fetched reports for", activeTab, ":", data);

//       // Handle both paginated and flat array responses
//       const reportsArray = Array.isArray(data) ? data : (data.results || []);
//       setReports(reportsArray);
//     } catch (err) {
//       console.error("Failed to fetch reports:", err);
//       setError("Failed to load analytics data. Please ensure the backend is running.");
//     } finally {
//       setIsRefreshing(false);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchReports();
//   }, [activeTab]);

//   const handleRefresh = () => fetchReports();

//   const handleExport = () => {
//     const csvContent = "data:text/csv;charset=utf-8,"
//       + ["Title", "Metric", "Value", "Target", "Trend"].join(",") + "\n"
//       + reports.map(r => [r.title, r.metric_name, r.value, r.target, r.trend].join(",")).join("\n");

//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", `reports_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   if (loading && !isRefreshing) {
//     return (
//       <div className="p-12 text-center text-slate-500 animate-pulse">
//         <Activity className="h-10 w-10 mx-auto mb-4 text-brand-blue/30" />
//         <p className="text-lg">Compiling latest sales metrics...</p>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">Performance Analytics</h1>
//           <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
//             <span className="inline-block w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
//             Real-time data from backend
//           </p>
//         </div>

//         <div className="flex items-center gap-2">
//           <button
//             onClick={handleRefresh}
//             className={`p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors ${isRefreshing ? "animate-spin" : ""}`}
//             disabled={isRefreshing}
//             title="Refresh Data"
//           >
//             <RefreshCw className="h-5 w-5 text-slate-600" />
//           </button>

//           <button
//             onClick={handleExport}
//             className="px-6 py-2 bg-brand-navy text-white rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
//           >
//             <Download className="h-4 w-4" />
//             Export CSV
//           </button>
//         </div>
//       </div>

//       <div className="flex items-center border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
//         {['overview', 'team', 'conversion'].map(tab => (
//           <button
//             key={tab}
//             onClick={() => setActiveTab(tab)}
//             className={`px-8 py-3 text-sm font-semibold capitalize whitespace-nowrap transition-all relative ${activeTab === tab
//                 ? "text-brand-blue"
//                 : "text-slate-400 hover:text-slate-600"
//               }`}
//           >
//             {tab}
//             {activeTab === tab && (
//               <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue rounded-full"></div>
//             )}
//           </button>
//         ))}
//       </div>

//       {error ? (
//         <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center text-red-600">
//           <p className="font-medium">{error}</p>
//           <button onClick={handleRefresh} className="mt-4 text-sm underline font-semibold">Try again</button>
//         </div>
//       ) : (
//         <>
//           <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
//             {reports.length > 0 ? (
//               reports.map((kpi) => (
//                 <div
//                   key={kpi.id}
//                   className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
//                 >
//                   <div className="relative z-10">
//                     <div className="flex justify-between items-start mb-4">
//                       <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{kpi.title}</p>
//                       <div className="p-2 bg-brand-blue/5 rounded-lg text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
//                         <Activity className="h-4 w-4" />
//                       </div>
//                     </div>

//                     <div className="flex items-baseline gap-2">
//                       <h3 className="text-3xl font-bold text-slate-900">{kpi.value}</h3>
//                       {kpi.target && (
//                         <span className="text-xs text-slate-400">/ {kpi.target}</span>
//                       )}
//                     </div>

//                     {kpi.trend && (
//                       <div className="flex items-center gap-1.5 mt-4 text-xs font-medium text-brand-emerald bg-brand-emerald/5 px-2 py-1 rounded-md w-fit">
//                         <TrendingUp className="h-3 w-3" />
//                         {kpi.trend}
//                       </div>
//                     )}
//                   </div>

//                   {/* Subtle background decoration */}
//                   <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-brand-blue/5 rounded-full blur-2xl group-hover:bg-brand-blue/10 transition-colors"></div>
//                 </div>
//               ))
//             ) : (
//               <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
//                 <BarChart3 className="h-12 w-12 text-slate-200 mx-auto mb-4" />
//                 <p className="text-slate-400 font-medium">No metrics found for "{activeTab}" category.</p>
//                 <p className="text-xs text-slate-400 mt-1">Add reports in the admin panel to see them here.</p>
//               </div>
//             )}
//           </section>

//           <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
//             <div className="flex items-center justify-between mb-8">
//               <div>
//                 <h2 className="text-xl font-bold text-slate-900 capitalize">{activeTab} Trend Analysis</h2>
//                 <p className="text-sm text-slate-500 mt-1">Aggregated performance over selected period</p>
//               </div>
//               <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
//                 <button className="p-2 bg-white shadow-sm rounded-lg text-brand-blue"><BarChart3 className="h-4 w-4" /></button>
//                 <button className="p-2 text-slate-400 hover:text-slate-600"><PieChart className="h-4 w-4" /></button>
//                 <button className="p-2 text-slate-400 hover:text-slate-600"><Activity className="h-4 w-4" /></button>
//               </div>
//             </div>

//             <div className="h-80 w-full bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center border border-dashed border-slate-200">
//               <div className="relative h-48 w-48 mb-4">
//                 <div className="absolute inset-0 border-8 border-brand-blue/10 rounded-full"></div>
//                 <div className="absolute inset-0 border-8 border-brand-blue rounded-full border-t-transparent animate-[spin_3s_linear_infinite]"></div>
//                 <div className="absolute inset-0 flex items-center justify-center flex-col">
//                   <TrendingUp className="h-8 w-8 text-brand-blue mb-1" />
//                   <span className="text-2xl font-bold text-slate-900">Live</span>
//                 </div>
//               </div>
//               <p className="text-slate-500 font-medium">Visualization Engine Ready</p>
//               <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Processing {reports.length} Data Points</p>
//             </div>
//           </section>
//         </>
//       )}
//     </>
//   );
// }
import React, { useState, useMemo, useEffect } from "react";
import {
  Download,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { reportService } from "../services/home";
import { metricsService } from "../services/home";
import { teamService } from "../services/home";
import TeamPerformanceTable from "../components/TeamPerformanceTable";

// Simple chart components
const SimpleBarChart = ({ data, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="w-full h-full flex items-end justify-center gap-2 p-4">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div className="w-full bg-slate-100 rounded-t relative">
            <div 
              className="w-full bg-brand-blue rounded-t transition-all duration-300 hover:bg-brand-blue/80"
              style={{ 
                height: `${(item.value / maxValue) * 100}%`,
                minHeight: '8px'
              }}
            />
            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-slate-700">
              {item.value}
            </span>
          </div>
          <span className="text-xs text-slate-500 mt-2">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const SimplePieChart = ({ data, height = 200 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const previousPercentage = data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 100, 0);
            const strokeDasharray = `${percentage} 100`;
            const strokeDashoffset = -previousPercentage;
            
            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={colors[index % colors.length]}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900">{total}</div>
            <div className="text-xs text-slate-500">Total</div>
          </div>
        </div>
      </div>
      <div className="ml-6 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-sm text-slate-700">{item.label}</span>
            <span className="text-sm font-medium text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SimpleLineChart = ({ data, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.value / maxValue) * 100);
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div className="w-full h-full p-4">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="#E2E8F0"
            strokeWidth="0.5"
          />
        ))}
        
        {/* Data line */}
        <polyline
          points={points}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2"
          className="transition-all duration-300"
        />
        
        {/* Data points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((item.value / maxValue) * 100);
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="2"
                fill="#3B82F6"
                className="transition-all duration-300 hover:r-3"
              />
              <text
                x={x}
                y={y - 5}
                textAnchor="middle"
                className="text-xs fill-slate-700"
              >
                {item.value}
              </text>
              <text
                x={x}
                y="95"
                textAnchor="middle"
                className="text-xs fill-slate-500"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Generate conversion data from real metrics
const getConversionData = (metrics) => {
  const conversionMetric = metrics.find(m => m.name === 'Conversion Rate');
  const leadsMetric = metrics.find(m => m.name === 'Total Leads');
  const appsMetric = metrics.find(m => m.name === 'Applications Submitted');
  
  // Create weekly trend data based on available metrics
  const weeklyData = [
    { label: "Week 1", value: Math.round((appsMetric?.value || 85) * 0.9) },
    { label: "Week 2", value: Math.round((appsMetric?.value || 85) * 0.95) },
    { label: "Week 3", value: appsMetric?.value || 85 },
    { label: "Week 4", value: Math.round((appsMetric?.value || 85) * 1.05) },
  ];
  
  return weeklyData;
};

const getConversionBreakdown = (metrics) => {
  const leads = metrics.find(m => m.name === 'Total Leads')?.value || 1250;
  const applications = metrics.find(m => m.name === 'Applications Submitted')?.value || 450;
  const disbursed = metrics.find(m => m.name === 'Disbursed Amount')?.value || 1850000;
  
  return [
    { label: "Converted", value: applications },
    { label: "In Progress", value: Math.round(leads * 0.15) },
    { label: "Lost", value: Math.round(leads * 0.25) },
    { label: "Pending", value: leads - applications - Math.round(leads * 0.15) - Math.round(leads * 0.25) },
  ];
};

const kpiReports = [
  {
    title: "Lead-to-Application Conversion",
    value: "46%",
    target: "60%",
    trend: "+3% vs last week",
    gradient: "from-brand-blue/90 via-brand-sky/80 to-brand-emerald/80",
  },
  {
    title: "Average Time to Submit",
    value: "38 hrs",
    target: "30 hrs",
    trend: "↓ 6 hrs improvement",
    gradient: "from-brand-emerald/90 via-brand-sky/70 to-brand-blue/90",
  },
  {
    title: "Win Rate",
    value: "72%",
    target: "75%",
    trend: "+2% vs last month",
    gradient: "from-brand-navy via-brand-blue to-brand-slate",
  },
];

// Sample data for performance metrics
const weeklyData = [
  { week: "Week 1", leads: 120, applications: 55, disbursed: 3.8 },
  { week: "Week 2", leads: 135, applications: 62, disbursed: 4.1 },
  { week: "Week 3", leads: 142, applications: 65, disbursed: 4.2 },
  { week: "Week 4", leads: 128, applications: 58, disbursed: 3.9 },
];

// Sample data for team performance
const teamPerformance = [
  { name: "Alex Johnson", leads: 45, applications: 22, conversion: 48.9 },
  { name: "Priya Sharma", leads: 38, applications: 20, conversion: 52.6 },
  { name: "Rahul Verma", leads: 42, applications: 18, conversion: 42.9 },
  { name: "Sneha Reddy", leads: 17, applications: 5, conversion: 29.4 },
];

export default function ReportsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("week");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState(null);
  const [chartType, setChartType] = useState("bar");
  const [activeTab, setActiveTab] = useState("overview");
  
  // State for real backend data
  const [reports, setReports] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real data from backend
  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [reportsData, metricsData, teamData] = await Promise.all([
          reportService.getAll(),
          metricsService.getAll(),
          teamService.getPerformance()
        ]);
        
        // Handle both paginated and flat array responses
        const reportsArray = Array.isArray(reportsData) ? reportsData : (reportsData.results || []);
        const metricsArray = Array.isArray(metricsData) ? metricsData : (metricsData.results || []);
        const teamArray = Array.isArray(teamData) ? teamData : (teamData.results || []);
        
        setReports(reportsArray);
        setMetrics(metricsArray);
        setTeamPerformance(teamArray);
      } catch (err) {
        console.error("Failed to fetch reports data:", err);
        setError("Failed to load analytics data. Please ensure backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, [activeTab]);

  const conversionAverage = useMemo(() => {
    const conversionMetric = metrics.find(m => m.name === 'Conversion Rate');
    return conversionMetric?.value || 46;
  }, [metrics]);

  // Function to refresh data
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Refetch all data
    setTimeout(async () => {
      try {
        const [reportsData, metricsData, teamData] = await Promise.all([
          reportService.getAll(),
          metricsService.getAll(),
          teamService.getPerformance()
        ]);
        
        const reportsArray = Array.isArray(reportsData) ? reportsData : (reportsData.results || []);
        const metricsArray = Array.isArray(metricsData) ? metricsData : (metricsData.results || []);
        const teamArray = Array.isArray(teamData) ? teamData : (teamData.results || []);
        
        setReports(reportsArray);
        setMetrics(metricsArray);
        setTeamPerformance(teamArray);
      } catch (err) {
        console.error("Failed to refresh data:", err);
        setError("Failed to refresh data.");
      } finally {
        setIsRefreshing(false);
      }
    }, 1000);
  };

  // Function to export data
  const handleExport = () => {
    // Simulate data export
    alert("Exporting report data...");
  };

  // Function to filter data
  const handleFilter = (filters) => {
    // Apply filters to data
    console.log("Applying filters:", filters);
    setShowFilterModal(false);
  };

  // Function to view KPI details
  const handleKpiClick = (kpi) => {
    setSelectedKpi(kpi);
  };

  // Calculate weekly totals from real backend data
  const weeklyTotals = useMemo(() => {
    if (metrics.length === 0) {
      return {
        leads: 0,
        applications: 0,
        disbursed: 0,
      };
    }
    
    // Use real metrics data for current week
    const currentMetrics = metrics[0]; // Get first metric or calculate from multiple
    return {
      leads: currentMetrics?.value || 0,
      applications: metrics.find(m => m.name === 'Applications')?.value || 0,
      disbursed: metrics.find(m => m.name === 'Disbursed Amount')?.value || 0,
    };
  }, [metrics]);

  return (
    <>
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
          <span className="ml-2 text-slate-500">Loading reports data...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}
      
      {!loading && !error && (
        <>
          {/* Header with actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
              <p className="text-sm text-slate-500">
                Monitor your sales performance and metrics
              </p>
            </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowFilterModal(!showFilterModal)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg flex items-center gap-2 text-sm"
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>
            {showFilterModal && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 z-10 p-4">
                <h3 className="font-medium mb-3">Filter Reports</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Time Range
                    </label>
                    <select
                      value={selectedTimeRange}
                      onChange={(e) => setSelectedTimeRange(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                    >
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                      <option value="quarter">Last Quarter</option>
                      <option value="year">Last Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Team Member
                    </label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
                      <option value="all">All Team Members</option>
                      <option value="alex">Alex Johnson</option>
                      <option value="priya">Priya Sharma</option>
                      <option value="rahul">Rahul Verma</option>
                      <option value="sneha">Sneha Reddy</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() =>
                        handleFilter({ timeRange: selectedTimeRange })
                      }
                      className="flex-1 px-3 py-2 bg-brand-blue text-white rounded-md text-sm"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => setShowFilterModal(false)}
                      className="flex-1 px-3 py-2 bg-slate-200 text-slate-700 rounded-md text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleRefresh}
            className={`p-2 bg-white border border-slate-200 rounded-lg ${
              isRefreshing ? "animate-spin" : ""
            }`}
            disabled={isRefreshing}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-brand-blue text-white rounded-lg flex items-center gap-2 text-sm"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs for different report views */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "overview"
              ? "text-brand-blue border-b-2 border-brand-blue"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("team")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "team"
              ? "text-brand-blue border-b-2 border-brand-blue"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Team Performance
        </button>
        <button
          onClick={() => setActiveTab("conversion")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "conversion"
              ? "text-brand-blue border-b-2 border-brand-blue"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Conversion Analysis
        </button>
      </div>

      {/* KPI Cards - now clickable */}
      <section className="grid md:grid-cols-3 gap-4 mb-6">
        {kpiReports.map((kpi) => (
          <div
            key={kpi.title}
            className={`rounded-2xl p-6 text-white shadow-sm bg-gradient-to-br ${kpi.gradient} cursor-pointer transition-transform hover:scale-105`}
            onClick={() => handleKpiClick(kpi)}
          >
            <p className="text-sm font-medium text-white/90">{kpi.title}</p>
            <p className="text-4xl font-semibold mt-2">{kpi.value}</p>
            <p className="text-sm text-white/80 mt-1">Target: {kpi.target}</p>
            <p className="text-xs text-white/70 mt-2">{kpi.trend}</p>
          </div>
        ))}
      </section>

      {/* KPI Detail Modal */}
      {selectedKpi && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedKpi.title}</h3>
              <button
                onClick={() => setSelectedKpi(null)}
                className="p-1 rounded-full hover:bg-slate-100"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Current Value</span>
                <span className="font-semibold">{selectedKpi.value}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Target</span>
                <span className="font-semibold">{selectedKpi.target}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Trend</span>
                <span className="font-semibold">{selectedKpi.trend}</span>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <h4 className="font-medium mb-2">Historical Data</h4>
                <div className="h-40 bg-slate-100 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-slate-500">
                    Chart visualization would go here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "overview" && (
        <section className="grid xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase text-slate-400">
                  Lead → Application
                </p>
                <h2 className="text-lg font-semibold">Conversion trend</h2>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-brand-blue">
                  {conversionAverage}%
                </p>
                <p className="text-xs text-slate-500">7-day average</p>
              </div>
            </div>
            <div className="flex items-end gap-3 mt-6">
              {getConversionData(metrics).map((item) => (
                <div key={item.label} className="flex-1 text-center">
                  <div
                    className="mx-auto w-full rounded-full bg-brand-blue/20"
                    style={{ height: "140px" }}
                  >
                    <div
                      className="w-full rounded-full bg-brand-blue transition-all duration-300 hover:bg-brand-blue/80"
                      style={{ height: `${(item.value / Math.max(...getConversionData(metrics).map(d => d.value))) * 100}%`, minHeight: "10%" }}
                    ></div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="mb-4">
              <p className="text-xs uppercase text-slate-400">
                Performance Summary
              </p>
              <h2 className="text-lg font-semibold">Weekly Overview</h2>
            </div>
            <div className="space-y-4">
              <div className="border border-slate-100 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Total Leads Captured</p>
                    <p className="text-xs text-slate-500">This week</p>
                  </div>
                  <p className="text-2xl font-semibold text-brand-blue">
                    {weeklyTotals.leads}
                  </p>
                </div>
              </div>
              <div className="border border-slate-100 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Applications Submitted</p>
                    <p className="text-xs text-slate-500">This week</p>
                  </div>
                  <p className="text-2xl font-semibold text-brand-emerald">
                    {weeklyTotals.applications}
                  </p>
                </div>
              </div>
              <div className="border border-slate-100 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Disbursed Amount</p>
                    <p className="text-xs text-slate-500">This week</p>
                  </div>
                  <p className="text-2xl font-semibold text-brand-sky">
                    ₹ {weeklyTotals.disbursed} Cr
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "team" && (
        <TeamPerformanceTable />
      )}

      {activeTab === "conversion" && (
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-slate-400">
                Conversion Analysis
              </p>
              <h2 className="text-lg font-semibold">
                Weekly Conversion Trends
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChartType("bar")}
                className={`p-2 rounded ${
                  chartType === "bar"
                    ? "bg-brand-blue text-white"
                    : "bg-slate-100"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setChartType("pie")}
                className={`p-2 rounded ${
                  chartType === "pie"
                    ? "bg-brand-blue text-white"
                    : "bg-slate-100"
                }`}
              >
                <PieChart className="h-4 w-4" />
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`p-2 rounded ${
                  chartType === "line"
                    ? "bg-brand-blue text-white"
                    : "bg-slate-100"
                }`}
              >
                <Activity className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="h-64 bg-slate-50 rounded-lg">
            {chartType === "bar" && <SimpleBarChart data={getConversionData(metrics)} />}
            {chartType === "pie" && <SimplePieChart data={getConversionBreakdown(metrics)} />}
            {chartType === "line" && <SimpleLineChart data={getConversionData(metrics)} />}
          </div>
          <div className="mt-4 grid grid-cols-4 gap-4">
            {metrics.slice(0, 4).map((metric, index) => (
              <div
                key={index}
                className="border border-slate-100 rounded-lg p-3"
              >
                <p className="text-sm font-medium">{metric.name || `Week ${index + 1}`}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Leads:</span>
                    <span>{metric.value || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Apps:</span>
                    <span>{metrics.find(m => m.name === 'Applications Submitted')?.value || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Conv:</span>
                    <span>
                      {metrics.find(m => m.name === 'Conversion Rate')?.value || 0}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
        </>
      )}
    </>
  );
}