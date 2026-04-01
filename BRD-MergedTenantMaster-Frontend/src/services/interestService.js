import axiosInstance from "../utils/axiosInstance";

export const integrationService = {
  /**
   * Send SMS via MSG91
   */
  sendMsg91Sms: async (phone, message) => {
    try {
      const res = await axiosInstance.post("integrations/sms/msg91/", { phone, message });
      console.log("ok 200 - POST integrations/sms/msg91/");
      return { ok: true, data: res.data };
    } catch (err) {
      console.error("Error sending MSG91 SMS:", err);
      return { ok: false, error: err };
    }
  },

  /**
   * Make Exotel Call
   */
  makeExotelCall: async (from_number, to_number) => {
    try {
      const res = await axiosInstance.post("integrations/exotel/call/", { from_number, to_number });
      console.log("ok 200 - POST integrations/exotel/call/");
      return { ok: true, data: res.data };
    } catch (err) {
      console.error("Error making Exotel call:", err);
      return { ok: false, error: err };
    }
  },

  /**
   * Make MyOperator Call
   */
  makeMyOperatorCall: async (customer_number, agent_number) => {
    try {
      const res = await axiosInstance.post("integrations/myoperator/call/", { customer_number, agent_number });
      console.log("ok 200 - POST integrations/myoperator/call/");
      return { ok: true, data: res.data };
    } catch (err) {
      console.error("Error making MyOperator call:", err);
      return { ok: false, error: err };
    }
  },

  /**
   * Get CAMS Account Statement
   */
  getCamsStatement: async (payload) => {
    try {
      const res = await axiosInstance.post("integrations/cams/account-statement/", payload);
      console.log("ok 200 - POST integrations/cams/account-statement/");
      return { ok: true, data: res.data };
    } catch (err) {
      console.error("Error fetching CAMS statement:", err);
      return { ok: false, error: err };
    }
  },

  /**
   * Send WhatsApp Template Message
   */
  sendWhatsAppTemplate: async (payload) => {
    try {
      const res = await axiosInstance.post("integrations/whatsapp/send-template/", payload);
      console.log("ok 200 - POST integrations/whatsapp/send-template/");
      return { ok: true, data: res.data };
    } catch (err) {
      console.error("Error sending WhatsApp template:", err);
      return { ok: false, error: err };
    }
  },

  /**
   * Create GCP Instance
   */
  createGcpInstance: async (payload) => {
    try {
      const res = await axiosInstance.post("integrations/gcp/create-instance/", payload);
      console.log("ok 200 - POST integrations/gcp/create-instance/");
      return { ok: true, data: res.data };
    } catch (err) {
      console.error("Error creating GCP instance:", err);
      return { ok: false, error: err };
    }
  },

  /**
   * Test Video API
   */
  testVideoApi: async () => {
    try {
      const res = await axiosInstance.get("integrations/test-video-api/");
      console.log("ok 200 - GET integrations/test-video-api/");
      return { ok: true, data: res.data };
    } catch (err) {
      console.error("Error testing video API:", err);
      return { ok: false, error: err };
    }
  },

  /**
   * Google Maps Geocode
   */
  googleMapsGeocode: async (address) => {
    try {
      const res = await axiosInstance.post("integrations/google-maps/geocode/", { address });
      console.log("ok 200 - POST integrations/google-maps/geocode/");
      return { ok: true, data: res.data };
    } catch (err) {
      console.error("Error geocoding address:", err);
      return { ok: false, error: err };
    }
  }
};
