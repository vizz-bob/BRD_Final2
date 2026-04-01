import { useState, useEffect } from "react";
import { crmToolService } from "../services/piplines";

export const useCRMIntegrations = () => {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tools = await crmToolService.getAll();
      
      // Transform backend data to match frontend format
      const transformedIntegrations = tools.map(tool => ({
        id: tool.id,
        name: tool.name,
        status: getSyncStatus(tool),
        badge: tool.status,
        color: getStatusColor(tool.status),
        type: getSyncType(tool.status),
        lastSync: tool.last_synced_at || "Never synced",
        description: tool.description || getStatusDescription(tool.status),
        sync_frequency: tool.sync_frequency,
        originalData: tool // Keep original data for reference
      }));
      
      setIntegrations(transformedIntegrations);
    } catch (err) {
      console.error("Failed to fetch CRM integrations:", err);
      setError("Failed to load CRM integrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  return {
    integrations,
    loading,
    error,
    refetch: fetchIntegrations
  };
};

// Helper functions to transform backend data to frontend format
const getSyncStatus = (tool) => {
  if (!tool.last_synced_at) return "Never synced";
  if (tool.status === "ACTIVE") return `Synced ${tool.sync_frequency || 'automatically'}`;
  if (tool.status === "ON_DEMAND") return "Manual push available";
  return "Passive mode";
};

const getStatusColor = (status) => {
  const colors = {
    ACTIVE: "text-brand-emerald",
    PASSIVE: "text-brand-slate", 
    ON_DEMAND: "text-brand-blue"
  };
  return colors[status] || "text-brand-slate";
};

const getSyncType = (status) => {
  const types = {
    ACTIVE: "auto",
    PASSIVE: "passive",
    ON_DEMAND: "manual"
  };
  return types[status] || "passive";
};

const getStatusDescription = (status) => {
  const descriptions = {
    ACTIVE: "Automatic synchronization enabled",
    PASSIVE: "Activity reminders only",
    ON_DEMAND: "Click to sync manually"
  };
  return descriptions[status] || "No description available";
};

export default useCRMIntegrations;
