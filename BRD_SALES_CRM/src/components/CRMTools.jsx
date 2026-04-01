import React, { useState, useEffect } from "react";
import { RefreshCw, Plus, Settings, Play, Pause } from "lucide-react";
import { crmToolService } from "../services/home";

const CRMTools = ({ showAddButton = true, onAddTool = null }) => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTools = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await crmToolService.getAll();
      setTools(data);
    } catch (err) {
      console.error("Failed to fetch CRM tools:", err);
      setError("Failed to load CRM tools");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTools();
    setRefreshing(false);
  };

  const handleSync = async (toolId) => {
    try {
      await crmToolService.sync(toolId);
      await fetchTools(); // Refresh the list
    } catch (err) {
      console.error("Failed to sync tool:", err);
      setError("Failed to sync tool");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: "bg-green-100 text-green-800 border-green-200",
      PASSIVE: "bg-gray-100 text-gray-800 border-gray-200",
      ON_DEMAND: "bg-blue-100 text-blue-800 border-blue-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      ACTIVE: <Play className="h-4 w-4" />,
      PASSIVE: <Pause className="h-4 w-4" />,
      ON_DEMAND: <Settings className="h-4 w-4" />
    };
    return icons[status] || <Settings className="h-4 w-4" />;
  };

  useEffect(() => {
    fetchTools();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="mb-4">
          <p className="text-xs uppercase text-slate-400">CRM Tools</p>
          <h2 className="text-lg font-semibold">Integration Status</h2>
        </div>
        <div className="animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="border-b border-slate-100 p-4">
              <div className="flex justify-between">
                <div className="h-4 bg-slate-200 rounded w-32"></div>
                <div className="h-4 bg-slate-200 rounded w-20"></div>
                <div className="h-4 bg-slate-200 rounded w-16"></div>
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
        <button onClick={fetchTools} className="mt-2 text-sm underline text-red-600">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-xs uppercase text-slate-400">CRM Tools</p>
          <h2 className="text-lg font-semibold">Integration Status</h2>
          <p className="text-sm text-slate-500 mt-1">
            {tools.length} tools configured
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {showAddButton && onAddTool && (
            <button
              onClick={onAddTool}
              className="p-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
              title="Add new CRM tool"
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
            title="Refresh tools"
          >
            <RefreshCw className="h-4 w-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Tools List */}
      {tools.length > 0 ? (
        <div className="space-y-4">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className={`border rounded-lg p-4 ${getStatusColor(tool.status)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {tool.name}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tool.status)}`}>
                      {getStatusIcon(tool.status)}
                      {tool.status}
                    </span>
                  </div>
                  
                  {tool.description && (
                    <p className="text-sm text-slate-600 mb-3">
                      {tool.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {tool.sync_frequency && (
                      <div>
                        <p className="font-medium text-slate-700">Sync Frequency</p>
                        <p className="text-slate-600">{tool.sync_frequency}</p>
                      </div>
                    )}
                    
                    {tool.last_synced_at && (
                      <div>
                        <p className="font-medium text-slate-700">Last Sync</p>
                        <p className="text-slate-600">
                          {new Date(tool.last_synced_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleSync(tool.id)}
                    className="p-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                    title="Sync tool"
                  >
                    <RefreshCw className="h-4 w-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No CRM tools configured</p>
          <p className="text-xs text-slate-400 mt-1">
            Add your first CRM integration tool
          </p>
          {showAddButton && onAddTool && (
            <button
              onClick={onAddTool}
              className="mt-4 px-4 py-2 bg-brand-blue text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
              Add First Tool
            </button>
          )}
        </div>
      )}

      {/* Summary Statistics */}
      {tools.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {tools.filter(t => t.status === 'ACTIVE').length}
              </p>
              <p className="text-xs text-slate-500">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-600">
                {tools.filter(t => t.status === 'PASSIVE').length}
              </p>
              <p className="text-xs text-slate-500">Passive</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {tools.filter(t => t.status === 'ON_DEMAND').length}
              </p>
              <p className="text-xs text-slate-500">On Demand</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {tools.length}
              </p>
              <p className="text-xs text-slate-500">Total Tools</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMTools;
