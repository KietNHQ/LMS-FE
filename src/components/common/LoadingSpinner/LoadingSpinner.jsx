import "./LoadingSpinner.css";

export default function LoadingSpinner({
  label = "Đang tải dữ liệu...",
  fullScreen = false,
  size = "md",
  role = "admin", // admin, teacher, student, parent
}) {
  return (
    <div className={`common-loading-spinner ${fullScreen ? "is-fullscreen" : ""} theme-${role}`}>
      <div className={`spinner-triple-rings size-${size}`}>
        <div className="ring ring-outer"></div>
        <div className="ring ring-middle"></div>
        <div className="ring ring-inner"></div>
      </div>
      {label ? <p className="common-loading-spinner__label">{label}</p> : null}
    </div>
  );
}

