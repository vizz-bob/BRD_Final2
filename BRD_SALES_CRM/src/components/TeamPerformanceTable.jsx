import React, { useState } from "react";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { useTeamPerformance } from "../hooks/useTeamPerformance";

const TeamPerformanceTable = ({ showRefresh = true, limit = null }) => {
  const { teamPerformance, loading, error, refetch } = useTeamPerformance();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getPerformanceColor = (conversion) => {
    if (conversion >= 50) return "bg-green-500";
    if (conversion >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getPerformanceText = (conversion) => {
    if (conversion >= 50) return "Excellent";
    if (conversion >= 40) return "Good";
    return "Needs Improvement";
  };

  const getTrendIcon = (value) => {
    // Since we don't have historical data in this endpoint, just show static
    return value >= 50 ? <TrendingUp className="h-3 w-3" /> : null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="mb-4">
          <p className="text-xs uppercase text-slate-400">Team Performance</p>
          <h2 className="text-lg font-semibold">Individual Metrics</h2>
        </div>
        <div className="animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="border-b border-slate-100 p-3">
              <div className="flex justify-between">
                <div className="h-4 bg-slate-200 rounded w-32"></div>
                <div className="h-4 bg-slate-200 rounded w-16"></div>
                <div className="h-4 bg-slate-200 rounded w-16"></div>
                <div className="h-4 bg-slate-200 rounded w-16"></div>
                <div className="h-4 bg-slate-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <button onClick={refetch} className="mt-2 text-sm underline text-red-600">
          Try again
        </button>
      </div>
    );
  }

  // Limit results if specified
  const displayData = limit ? teamPerformance.slice(0, limit) : teamPerformance;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <p className="text-xs uppercase text-slate-400">Team Performance</p>
          <h2 className="text-lg font-semibold">Individual Metrics</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time data from {teamPerformance.length} team members
          </p>
        </div>
        
        {showRefresh && (
          <button
            onClick={handleRefresh}
            className={`p-2 bg-white border border-slate-200 rounded-lg ${
              refreshing ? "animate-spin" : ""
            }`}
            disabled={refreshing}
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4 text-slate-600" />
          </button>
        )}
      </div>

      {displayData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left p-3 text-sm font-medium text-slate-700">
                  Team Member
                </th>
                <th className="text-left p-3 text-sm font-medium text-slate-700">
                  Leads
                </th>
                <th className="text-left p-3 text-sm font-medium text-slate-700">
                  Applications
                </th>
                <th className="text-left p-3 text-sm font-medium text-slate-700">
                  Disbursed
                </th>
                <th className="text-left p-3 text-sm font-medium text-slate-700">
                  Conversion Rate
                </th>
                <th className="text-left p-3 text-sm font-medium text-slate-700">
                  Performance
                </th>
                <th className="text-left p-3 text-sm font-medium text-slate-700">
                  Target Achievement
                </th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((member, index) => (
                <tr key={member.id || index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <div>
                      <p className="font-medium text-slate-900">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.role}</p>
                    </div>
                  </td>
                  <td className="p-3 font-medium">{member.leads}</td>
                  <td className="p-3">{member.applications}</td>
                  <td className="p-3">{member.disbursed}</td>
                  <td className="p-3 font-medium">{member.conversion}%</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getPerformanceColor(member.conversion)}`}
                          style={{ width: `${Math.min(member.conversion, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-600">
                        {getPerformanceText(member.conversion)}
                      </span>
                      {getTrendIcon(member.conversion)}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {member.target_achievement}%
                      </span>
                      {member.monthly_target > 0 && (
                        <span className="text-xs text-slate-500">
                          ₹{member.total_disbursed_amount.toLocaleString()} / ₹{member.monthly_target.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-400 font-medium">No team performance data available</p>
          <p className="text-xs text-slate-400 mt-1">
            Assign leads to team members to see performance metrics
          </p>
        </div>
      )}

      {/* Summary Statistics */}
      {displayData.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {displayData.reduce((sum, m) => sum + m.leads, 0)}
              </p>
              <p className="text-xs text-slate-500">Total Leads</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {displayData.reduce((sum, m) => sum + m.applications, 0)}
              </p>
              <p className="text-xs text-slate-500">Total Applications</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {displayData.reduce((sum, m) => sum + m.disbursed, 0)}
              </p>
              <p className="text-xs text-slate-500">Total Disbursed</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {displayData.length > 0 
                  ? (displayData.reduce((sum, m) => sum + m.conversion, 0) / displayData.length).toFixed(1)
                  : 0}%
              </p>
              <p className="text-xs text-slate-500">Avg Conversion</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPerformanceTable;
