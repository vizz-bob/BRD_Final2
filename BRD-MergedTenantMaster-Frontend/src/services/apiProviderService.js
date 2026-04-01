import axiosInstance from "../utils/axiosInstance";

export const apiProviderService = {
  /**
   * Fetch all integrated API providers from the backend.
   */
  getAll: async () => {
    try {
      const res = await axiosInstance.get("integrations/providers/");
      return { ok: true, data: res.data };
    } catch (err) {
      console.error("Error fetching API providers:", err);
      return { ok: false, error: err };
    }
  },

  /**
   * Update or create provider credentials.
   */
  updateOrCreate: async (providerName, credentials) => {
    try {
      const res = await axiosInstance.post("integrations/providers/", {
        provider: providerName,
        config: credentials,
      });
      return { ok: true, data: res.data };
    } catch (err) {
      console.error("Error saving provider credentials:", err);
      return { ok: false, error: err };
    }
  },

  /**
   * Activate a specific provider for a category.
   */
  activate: async (categoryId, providerName) => {
    try {
      const res = await axiosInstance.post("integrations/activate/", {
        category_id: categoryId,
        provider_name: providerName,
      });
      return { ok: true, data: res.data };
    } catch (err) {
      console.error("Error activating provider:", err);
      return { ok: false, error: err };
    }
  },

  /**
   * Repair tenant link (if any synchronization issue exists).
   */
  repairTenantLink: async () => {
    try {
      const res = await axiosInstance.post("integrations/repair-tenant-link/");
      return { ok: true, data: res.data };
    } catch (err) {
      console.error("Error repairing tenant link:", err);
      return { ok: false, error: err };
    }
  },
};
