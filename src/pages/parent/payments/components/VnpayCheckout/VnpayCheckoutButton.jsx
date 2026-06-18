import React, { useState } from "react";
import { FiCheckCircle, FiCreditCard, FiLoader } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import vnpayService from "../../../../../services/vnpayService";
import "./VnpayCheckout.css";

export default function VnpayCheckoutButton({
  payment,
  onSuccess,
  onError,
  onBeforeRedirect,
}) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isPaid = payment.status === "paid";
  const remainingAmount = Array.isArray(payment.breakdown)
    ? payment.breakdown.find((line) => line.key === "remaining")?.amount
    : undefined;
  const rawPayableAmount = Number(remainingAmount ?? payment.finalAmount ?? 0);
  const payableAmount = Number.isFinite(rawPayableAmount) ? Math.round(rawPayableAmount) : 0;

  const handleVnpayCheckout = async (event) => {
    event?.stopPropagation();

    if (isPaid || payableAmount <= 0) {
      return;
    }

    setLoading(true);

    try {
      const response = await vnpayService.createPaymentUrl({
        debtId: payment.id,
        description: `${payment.childName} - ${payment.title}`,
        amount: payableAmount,
        language: "vn",
      });

      if (onBeforeRedirect) {
        onBeforeRedirect(payment, response);
      }
      if (onSuccess) {
        onSuccess(response);
      }

      const paymentUrl = response.paymentUrl || response.data?.paymentUrl;
      if (!paymentUrl) {
        throw new Error("Không nhận được liên kết thanh toán VNPAY");
      }

      navigate(
        `/parent/payments/confirm?vnpay_status=pending&debt_id=${encodeURIComponent(
          payment.id,
        )}&redirect_url=${encodeURIComponent(paymentUrl)}`,
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Không thể tạo thanh toán VNPAY";

      if (onError) {
        onError(msg);
      }
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="btn-vnpay-checkout"
      onClick={handleVnpayCheckout}
      disabled={loading || isPaid || payableAmount <= 0}
      title={isPaid || payableAmount <= 0 ? "Không còn số tiền cần thanh toán" : "Thanh toán qua VNPAY"}
    >
      {loading ? (
        <>
          <FiLoader /> <span>Đang chuyển...</span>
        </>
      ) : isPaid ? (
        <>
          <FiCheckCircle /> <span>Đã thanh toán</span>
        </>
      ) : (
        <>
          <FiCreditCard /> <span>VNPAY</span>
        </>
      )}
    </button>
  );
}
