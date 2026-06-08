import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { FiCheckCircle, FiXCircle, FiLoader, FiArrowLeft, FiRefreshCw, FiShield } from "react-icons/fi";
import stripeService from "../../../services/stripeService";
import { formatVnd } from "../../../services/shared/payment/paymentShared";
import "./PaymentConfirm.css";

const STATUS = {
  LOADING: "loading",
  SUCCESS: "success",
  CANCELLED: "cancelled",
  ERROR: "error",
  PENDING: "pending",
};

export default function PaymentConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(STATUS.LOADING);
  const [session, setSession] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const confirmedSessionRef = useRef(null);
  const fetchedSessionRef = useRef(null);

  const stripeStatus = searchParams.get("stripe_status");
  const sessionId = searchParams.get("session_id");
  const redirectUrl = searchParams.get("redirect_url");
  const debtId = searchParams.get("debt_id");

  useEffect(() => {
    if (stripeStatus === STATUS.PENDING) {
      setStatus(STATUS.PENDING);
      setErrorMsg("");

      if (redirectUrl) {
        const timer = window.setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1200);

        return () => window.clearTimeout(timer);
      }

      return;
    }

    if (!stripeStatus || !sessionId) {
      setStatus(STATUS.ERROR);
      setErrorMsg("Thông tin thanh toán không hợp lệ. Vui lòng quay lại trang học phí.");
      return;
    }

    const fetchStatus = async () => {
      if (fetchedSessionRef.current === sessionId) {
        return;
      }

      fetchedSessionRef.current = sessionId;
      setStatus(STATUS.LOADING);
      setErrorMsg("");
      try {
        const data = await stripeService.getSessionStatus(sessionId);
        setSession(data);

        if (data.payment_status === "paid") {
          if (debtId && confirmedSessionRef.current !== sessionId) {
            await stripeService.confirmCheckoutSession({
              debtId,
              checkoutSessionId: sessionId,
            });
            confirmedSessionRef.current = sessionId;
          }

          setStatus(STATUS.SUCCESS);
          window.dispatchEvent(
            new CustomEvent("parent-payment-confirmed", {
              detail: {
                paymentId: debtId ? Number(debtId) : null,
                sessionId,
                paymentStatus: data.payment_status,
                amount: data.amount_total,
              },
            })
          );
        } else if (stripeStatus === "cancelled" || data.payment_status === "unpaid") {
          setStatus(STATUS.CANCELLED);
        } else {
          setStatus(STATUS.CANCELLED);
        }
      } catch (err) {
        fetchedSessionRef.current = null;
        console.error("Stripe session status check failed:", err);
        setStatus(STATUS.ERROR);
        setErrorMsg(
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Không thể xác minh thanh toán."
        );
      }
    };

    fetchStatus();
  }, [debtId, redirectUrl, sessionId, stripeStatus, retryCount]);

  const handleRetry = () => {
    fetchedSessionRef.current = null;
    confirmedSessionRef.current = null;
    setRetryCount((c) => c + 1);
  };

  const handleBack = () => {
    navigate("/parent/payments", { replace: true });
  };

  const renderIcon = () => {
    if (status === STATUS.LOADING) {
      return (
        <div className="confirm-icon confirm-icon--loading">
          <FiLoader className="spin" />
        </div>
      );
    }
    if (status === STATUS.PENDING) {
      return (
        <div className="confirm-icon confirm-icon--pending">
          <FiShield />
        </div>
      );
    }
    if (status === STATUS.SUCCESS) {
      return (
        <div className="confirm-icon confirm-icon--success">
          <FiCheckCircle />
        </div>
      );
    }
    if (status === STATUS.CANCELLED) {
      return (
        <div className="confirm-icon confirm-icon--cancelled">
          <FiXCircle />
        </div>
      );
    }
    return (
      <div className="confirm-icon confirm-icon--error">
        <FiXCircle />
      </div>
    );
  };

  const title = {
    [STATUS.LOADING]: "Đang xác minh thanh toán...",
    [STATUS.PENDING]: "Đang chuyển tới cổng thanh toán an toàn...",
    [STATUS.SUCCESS]: "Thanh toán thành công!",
    [STATUS.CANCELLED]: "Thanh toán đã bị hủy",
    [STATUS.ERROR]: "Không thể xác minh thanh toán",
  }[status] || "Kết quả thanh toán";

  const subtitle = {
    [STATUS.LOADING]:
      "Hệ thống đang kiểm tra trạng thái giao dịch với Stripe. Vui lòng đợi trong giây lát.",
    [STATUS.PENDING]:
      "Bạn sắp được chuyển sang trang thanh toán Visa/Mastercard. Vui lòng không tắt trình duyệt trong lúc chuyển hướng.",
    [STATUS.SUCCESS]:
      "Cảm ơn bạn! Học phí đã được thanh toán thành công qua Visa/Mastercard. Nhà trường sẽ ghi nhận và thông báo sớm nhất.",
    [STATUS.CANCELLED]:
      "Giao dịch thanh toán đã bị hủy. Bạn có thể quay lại trang học phí để thử lại hoặc chọn phương thức khác.",
    [STATUS.ERROR]: errorMsg,
  }[status] || "";

  const amount = session?.amount_total
    ? formatVnd(session.amount_total)
    : null;
  const studentName = session?.metadata?.student_name || null;
  const description = session?.metadata?.description || session?.description || null;
  const paidAt = useMemo(() => {
    if (!session?.created) return null;
    return new Date(session.created * 1000).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [session?.created]);

  return (
    <div className="payment-confirm-page">
      <div className="payment-confirm-card">
        {renderIcon()}

        <h1 className={`confirm-title confirm-title--${status}`}>
          {title}
        </h1>

        <p className="confirm-subtitle">{subtitle}</p>

        {status !== STATUS.LOADING && status !== STATUS.ERROR && status !== STATUS.PENDING && session && (
          <div className="confirm-details">
            {description && (
              <div className="confirm-detail-row">
                <span className="confirm-detail-label">Nội dung</span>
                <span className="confirm-detail-value">{description}</span>
              </div>
            )}
            {studentName && (
              <div className="confirm-detail-row">
                <span className="confirm-detail-label">Học sinh</span>
                <span className="confirm-detail-value">{studentName}</span>
              </div>
            )}
            {amount && (
              <div className="confirm-detail-row">
                <span className="confirm-detail-label">Số tiền</span>
                <span className="confirm-detail-value confirm-detail-value--amount">
                  {amount}
                </span>
              </div>
            )}
            {paidAt && (
              <div className="confirm-detail-row">
                <span className="confirm-detail-label">Thanh toán lúc</span>
                <span className="confirm-detail-value">{paidAt}</span>
              </div>
            )}
            {sessionId && (
              <div className="confirm-detail-row">
                <span className="confirm-detail-label">Mã giao dịch</span>
                <span className="confirm-detail-value confirm-detail-value--mono">
                  {sessionId.slice(0, 20)}...
                </span>
              </div>
            )}
          </div>
        )}

        {status === STATUS.LOADING && (
          <div className="confirm-loading-bar">
            <div className="confirm-loading-bar__fill" />
          </div>
        )}

        {status === STATUS.PENDING && (
          <div className="confirm-pending-panel">
            <div className="confirm-loading-bar">
              <div className="confirm-loading-bar__fill" />
            </div>
            <div className="confirm-pending-steps">
              <div className="confirm-pending-step is-active">
                <span>1</span>
                <div>
                  <strong>Tạo phiên thanh toán</strong>
                  <p>Hệ thống đã chuẩn bị giao dịch cho học phí của bạn.</p>
                </div>
              </div>
              <div className="confirm-pending-step is-active">
                <span>2</span>
                <div>
                  <strong>Chuyển sang Stripe</strong>
                  <p>Trang thanh toán Visa/Mastercard sẽ mở tự động sau giây lát.</p>
                </div>
              </div>
              <div className="confirm-pending-step">
                <span>3</span>
                <div>
                  <strong>Xác nhận kết quả</strong>
                  <p>Sau khi thanh toán xong, hệ thống sẽ đưa bạn về trang xác nhận.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="confirm-actions">
          <button
            type="button"
            className="confirm-btn confirm-btn--back"
            onClick={handleBack}
          >
            <FiArrowLeft />
            <span>Quay lại trang học phí</span>
          </button>

          {(status === STATUS.CANCELLED || status === STATUS.ERROR) && (
            <button
              type="button"
              className="confirm-btn confirm-btn--retry"
              onClick={handleRetry}
            >
              <FiRefreshCw />
              <span>Thử lại</span>
            </button>
          )}
        </div>

        <p className="confirm-help">
          Nếu cần hỗ trợ, vui lòng liên hệ nhà trường qua{" "}
          <Link to="/parent/support">trang Hỗ trợ</Link> hoặc hotline.
        </p>
      </div>
    </div>
  );
}
