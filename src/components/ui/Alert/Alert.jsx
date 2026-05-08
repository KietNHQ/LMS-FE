import "./Alert.css";

export default function Alert({
  type = "info",
  title,
  message,
  onClose,
  className = "",
}) {
  return (
    <div className={`ui-alert is-${type} ${className}`.trim()} role="status">
      <div className="ui-alert__content">
        {title ? <strong className="ui-alert__title">{title}</strong> : null}
        {message ? <p className="ui-alert__message">{message}</p> : null}
      </div>

      {typeof onClose === "function" ? (
        <button type="button" className="ui-alert__close" onClick={onClose} aria-label="Dong canh bao">
          x
        </button>
      ) : null}
    </div>
  );
}
