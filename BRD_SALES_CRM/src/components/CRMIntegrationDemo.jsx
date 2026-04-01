import React from "react";
import { useCRMIntegrations } from "../hooks/useCRMIntegrations";
import { RefreshCw, Plus, Settings, Play, Pause } from "lucide-react";

const CRMIntegrationDemo = () => {
  const { integrations, loading, error, refetch } = useCRMIntegrations();

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">CRM Integrations</h3>
        <div className="animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded p-3 mb-2">
              <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border">
        <h3 className="text-lg font-semibold mb-2 text-red-600">Error</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={refetch}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">CRM Integrations</h3>
        <div className="flex gap-2">
          <button
            onClick={refetch}
            className="p-2 bg-slate-100 rounded hover:bg-slate-200"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            title="Add CRM Tool"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {integrations.length === 0 ? (
        <div className="text-center py-8">
          <Settings className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No CRM integrations found</p>
          <p className="text-sm text-slate-400 mt-1">
            Add CRM tools in Django admin to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{integration.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${integration.color}`}>
                      {integration.badge}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-2">
                    {integration.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      {integration.type === 'auto' ? <Play className="h-3 w-3" /> : 
                       integration.type === 'manual' ? <RefreshCw className="h-3 w-3" /> : 
                       <Pause className="h-3 w-3" />}
                      {integration.status}
                    </span>
                    <span>Last sync: {integration.lastSync}</span>
                    {integration.sync_frequency && (
                      <span>Frequency: {integration.sync_frequency}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {integration.type === 'manual' && (
                    <button
                      className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      title="Sync Now"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    className="p-2 bg-slate-100 rounded hover:bg-slate-200"
                    title="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="font-semibold text-green-600">
              {integrations.filter(i => i.status === 'ACTIVE').length}
            </p>
            <p className="text-slate-500">Active</p>
          </div>
          <div>
            <p className="font-semibold text-blue-600">
              {integrations.filter(i => i.status === 'ON_DEMAND').length}
            </p>
            <p className="text-slate-500">On Demand</p>
          </div>
          <div>
            <p className="font-semibold text-slate-600">
              {integrations.filter(i => i.status === 'PASSIVE').length}
            </p>
            <p className="text-slate-500">Passive</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMIntegrationDemo;
