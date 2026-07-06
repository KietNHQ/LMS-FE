import "./Button.css";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  icon = null,
  block = false,
  loading = false,
  className = "",
  disabled = false,
  primary, // intentionally extracted — do NOT pass to DOM
  ...props
}) {
  const finalClassName = [
    "ui-button",
    `is-${variant}`,
    `is-${size}`,
    block ? "is-block" : "",
    loading ? "is-loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={finalClassName}
      disabled={disabled || loading}
      {...props}
    >
      {icon ? <span className="ui-button__icon">{icon}</span> : null}
      {children}
    </button>
  );
}
