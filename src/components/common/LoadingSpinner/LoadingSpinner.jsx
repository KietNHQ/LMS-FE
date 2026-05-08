import "./LoadingSpinner.css";

export default function LoadingSpinner({
  label = "Đang tải dữ liệu...",
  fullScreen = false,
  size = "md",
  role: propRole, // Rename to avoid confusion
}) {
  // Tự động nhận diện role từ URL nếu không được truyền vào
  const autoRole = window.location.pathname.includes("/parent") ? "parent" : "admin";
  const finalRole = propRole || autoRole;

  return (
    <div className={`common-loading-spinner ${fullScreen ? "is-fullscreen" : ""} theme-${finalRole}`}>
      <div className={`spinner-triple-rings size-${size}`}>
        <div className="ring ring-outer"></div>
        <div className="ring ring-middle"></div>
        <div className="ring ring-inner"></div>
      </div>
      {label ? <p className="common-loading-spinner__label">{label}</p> : null}
    </div>
  );
}


