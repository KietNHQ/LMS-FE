import axiosClient from "./shared/http/axiosClient";

const normalizeResponse = (res) => {
  if (res?.data && typeof res.data === "object" && !Array.isArray(res.data)) {
    return { ...res.data, ...res };
  }

  return res;
};

const buildVnpayQuery = (queryString) => {
  const params = new URLSearchParams(String(queryString || "").replace(/^\?/, ""));
  const vnpParams = new URLSearchParams();

  params.forEach((value, key) => {
    if (key.startsWith("vnp_")) {
      vnpParams.append(key, value);
    }
  });

  return vnpParams.toString();
};

const vnpayService = {
  createPaymentUrl: async ({ debtId, description, amount, bankCode, language }) => {
    const res = await axiosClient.post("/vnpay/create-payment-url", {
      debtId,
      description,
      amount,
      bankCode,
      language,
    });

    return normalizeResponse(res);
  },

  verifyReturn: async (queryString) => {
    const cleanQuery = buildVnpayQuery(queryString);
    if (!cleanQuery) {
      throw new Error("Thiếu dữ liệu phản hồi VNPAY");
    }

    const res = await axiosClient.get(`/vnpay/return?${cleanQuery}`);
    return normalizeResponse(res);
  },
};

export default vnpayService;
