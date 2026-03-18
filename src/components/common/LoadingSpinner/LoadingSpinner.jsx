import "./LoadingSpinner.css";

export default function LoadingSpinner({
  label = "Dang tai du lieu...",
  fullScreen = false,
  size = "md",
}) {
  return (
	<div className={`common-loading-spinner ${fullScreen ? "is-fullscreen" : ""}`}>
	  <span className={`common-loading-spinner__circle size-${size}`} aria-hidden="true" />
	  {label ? <p className="common-loading-spinner__label">{label}</p> : null}
	</div>
  );
}

