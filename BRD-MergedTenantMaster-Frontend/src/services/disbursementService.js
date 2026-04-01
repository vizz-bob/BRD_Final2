import axiosInstance from "../utils/axiosInstance";

// Fixed: Use correct disbursement endpoint instead of LMS
const BASE_URL = "disbursement/";

export const disbursementAPI = {

  getQueue: async () => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}disbursement-queue/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching disbursement queue:", error);
      throw error.response?.data || "Failed to fetch disbursement queue";
    }
  },

  disburse: async (loanAccountId) => {
    try {
      const response = await axiosInstance.post(`${BASE_URL}disburse/${loanAccountId}/`);
      return response.data;
    } catch (error) {
      console.error("Error during loan disbursement:", error);
      throw error.response?.data || "Disbursement failed";
    }
  },

  listAccounts: async (filters = {}) => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}loan-accounts/`, { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error fetching loan accounts:", error);
      throw error.response?.data || "Failed to fetch loan accounts";
    }
  },

  getAccountDetails: async (loanAccountId) => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}loan-accounts/${loanAccountId}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching loan account details:", error);
      throw error.response?.data || "Failed to fetch account details";
    }
  },

};