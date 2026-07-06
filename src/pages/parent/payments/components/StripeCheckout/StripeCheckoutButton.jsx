import React, { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import stripeService from "../../../../../services/stripeService";
import "./StripeCheckout.css";

function VisaIcon() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
      <rect width="20" height="14" rx="2" fill="#1A1F71"/>
      <text x="3" y="10" fill="white" fontSize="7" fontWeight="bold" fontFamily="Arial">VISA</text>
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
      <rect width="20" height="14" rx="2" fill="#000"/>
      <circle cx="7" cy="7" r="5" fill="#EB001B"/>
      <circle cx="13" cy="7" r="5" fill="#F79E1B"/>
      <path d="M10 3.2a5 5 0 010 7.6A5 5 0 0110 3.2z" fill="#FF5F00"/>
    </svg>
  );
}

export default function StripeCheckoutButton({ payment, onSuccess, onError, onBeforeRedirect }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const redirectToStripe = (checkoutUrl) => {
    const destination = checkoutUrl || null;
    navigate(
      `/parent/payments/confirm?stripe_status=pending&debt_id=${encodeURIComponent(payment.id)}${destination ? `&redirect_url=${encodeURIComponent(destination)}` : ""}`
    );
  };

  const handleStripeCheckout = async () => {
    setLoading(true);

    try {
      const response = await stripeService.createCheckoutSession({
        debtId: payment.id,
        description: `${payment.childName} - ${payment.title}`,
        amount: payment.finalAmount,
      });

      if (onBeforeRedirect) {
        onBeforeRedirect(payment, response);
      }
      if (onSuccess) onSuccess(response);
      if (response.checkoutUrl) {
        redirectToStripe(response.checkoutUrl);
        return;
      }
      navigate(`/parent/payments/confirm?stripe_status=success&session_id=${encodeURIComponent(response.sessionId)}`);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Lỗi không xác định";
      if (onError) onError(msg);
      setLoading(false);
    }
  };

  const isPaid = payment.status === "paid";

  return (
    <button
      className="btn-stripe-checkout"
      onClick={handleStripeCheckout}
      disabled={loading || isPaid}
      title={isPaid ? "Đã thanh toán" : "Thanh toán qua Visa/Mastercard"}
    >
      {loading ? (
        <span>Đang chuyển...</span>
      ) : isPaid ? (
        <>
          <FiCheckCircle /> <span>Đã thanh toán</span>
        </>
      ) : (
        <>
          <VisaIcon /> <MastercardIcon /> <span>Visa/Mastercard</span>
        </>
      )}
    </button>
  );
}
