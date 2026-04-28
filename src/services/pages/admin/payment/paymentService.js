import axiosClient from "../../../shared/http/axiosClient";

const PAYMENT_ENDPOINTS = {
    FEES: "/fees",
    BANK_ACCOUNTS: "/school-bank-accounts"
};

/**
 * Resiliently extracts rows from various API response structures
 */
const getRows = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.fees)) return payload.fees;
    return [];
};

const paymentService = {
    /**
     * List all fees with filters
     */
    listFees: async (params = {}) => {
        const response = await axiosClient.get(PAYMENT_ENDPOINTS.FEES, { params });
        return {
            items: getRows(response),
            pagination: response?.pagination || {}
        };
    },

    /**
     * List all school bank accounts
     */
    listBankAccounts: async (isActive = true) => {
        const response = await axiosClient.get(PAYMENT_ENDPOINTS.BANK_ACCOUNTS, {
            params: { isActive }
        });
        return getRows(response);
    }
};

export default paymentService;
