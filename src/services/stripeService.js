import axiosClient from "./shared/http/axiosClient";

const stripeService = {
  getPublishableKey: async () => {
    const res = await axiosClient.get("/stripe/publishable-key");
    return res.publishableKey;
  },

  createCheckoutSession: async ({ debtId, description, amount }) => {
    const res = await axiosClient.post("/stripe/create-checkout-session", {
      debtId,
      description,
      amount,
    });
    return res;
  },

  confirmCheckoutSession: async ({ debtId, checkoutSessionId }) => {
    const res = await axiosClient.post(`/guardians/me/payments/${encodeURIComponent(debtId)}/pay`, {
      checkoutSessionId,
    });
    return res;
  },

  getSessionStatus: async (sessionId) => {
    const res = await axiosClient.get(`/stripe/session/${sessionId}`);
    return res.session || res;
  },
};

export default stripeService;
